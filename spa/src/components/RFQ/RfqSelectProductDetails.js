import { Tooltip } from "@material-ui/core";
import React, { Component } from "react";
import {
    getAWSUrl, getLabelText,
    getLanguageResourceElasticIndex, getWebsiteLanguageGuid
} from '../../config';
import Button from "../../UI/Button/MaterialButton";
import { getPageResource } from "../../utility";
import CustomSearchMultiSelectDropdown_new from '../SupplierOnBoarding/CustomSearchMultiSelectdropdown_new';


class SelectProductDetails extends Component {
    constructor(props) {
        super(props)
        this.state = {
            commodityGuid: null,
            rfqLanguageResources: [],
        }
    }

    componentDidMount() {
        this.getRFQLanguageResource();
    }

    commodityclicknext = (commodityGuid, commodityName) => {
        const { next = f => f } = this.props;

        next(commodityGuid, commodityName);
    }

    Categoryclicknext = (categoryGuid, categoryName) => {
        const { next = f => f } = this.props;

        next(categoryGuid, categoryName);
    }

    subcategoryclicknext = (subcategoryGuid, subCategoryName) => {
        const { next = f => f } = this.props;

        next(subcategoryGuid, subCategoryName);
    }

    ProductTypeclicknext = (productTypeGuid, productTypeName) => {
        const { next = f => f } = this.props;

        next(productTypeGuid, productTypeName);
    }
    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }
    OnSelectChange = (data) => {
        let selectedCategories = [];
        selectedCategories = data.selectedCategories;
            this.setState({ ProductTypedetails: data.ProductTypedetails, selectedCategories: selectedCategories });
    }
    render() {
        let name = this.props.name !== undefined ? this.props.name : "";
        let commoditydata = this.props.commodityData !== undefined ? this.props.commodityData : [];
        let ProductTypedetails = this.props.ProductTypedetails !== undefined ? this.props.ProductTypedetails : [];

        let categorydata = this.props.categorydata !== undefined ? this.props.categorydata : [];
        let subcategorydata = this.props.subcategorydata !== undefined ? this.props.subcategorydata : [];
        // let ProductTypedata = this.props.ProductTypedata !== undefined ? this.props.ProductTypedata : [];
        let selectedCommodity = this.props.selectedCommodity !== undefined && this.props.selectedCommodity != "" ? this.props.selectedCommodity : "";
        let SelectedCategory = this.props.SelectedCategory !== undefined && this.props.SelectedCategory != "" ? this.props.SelectedCategory : "";
        let SelectedSubCategory = this.props.SelectedSubCategory !== undefined && this.props.SelectedSubCategory != "" ? this.props.SelectedSubCategory : "";
        return (
            <div className="newRfq">
                <div className="rfq_head">
                    {/* <p className="rfq_desc">{selectedCommodity} {this.props.SelectedCategory || this.props.SelectedSubCategory ? ">" : ''} {SelectedCategory}  </p>*/}
                    {/* <h5 className="rfq_title">Select {name}</h5> */}
                    <h5 className="rfq_title">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "select"; })[0], "Select") : ""} {name}</h5>
                </div>
                <div className="rfq_body">
                    <div className="product_detail_box_main">
                        {/* {commoditydata.map(item => (
                            <Tooltip key={item.commodityName} title={item.commodityName}>
                                <div onClick={() => { this.commodityclicknext(item.commodityGuid, item.commodityName) }} className={this.props.prevValue === item.commodityName ? "active product_detail_box" : "product_detail_box"}>
                                    {item.categoryImage != null && item.categoryImage != "" ?
                                        <img src={getAWSUrl() + 'CommodityIcons/' + item.categoryImage} /> : ""}
                                    <span>{item.commodityName}</span>
                                </div>
                            </Tooltip>
                        ))} */}
                        {ProductTypedetails.length > 0 ?
                            (<div className="newThemeInput CustomSearchMultiSelectDropdown">
                                <CustomSearchMultiSelectDropdown_new
                                    ProductTypedetails={ProductTypedetails}
                                    IsProductShow={true}
                                    IsSingleSelection={true}
                                    // onRef={ref => (this.child = ref)}
                                    onchange={this.OnSelectChange}
                                >
                                </CustomSearchMultiSelectDropdown_new>
                            </div>)
                            : ("")
                        }
                        {categorydata.map(item => (
                            <Tooltip key={item.categoryName} title={item.categoryName}>
                                <div onClick={() => { this.Categoryclicknext(item.categoryGuid, item.categoryName) }} className={this.props.prevValue === item.categoryName ? "active product_detail_box" : "product_detail_box"}>
                                    {item.categoryImage != null && item.categoryImage != "" ?
                                        <img src={getAWSUrl() + 'CategoryIcons/' + item.categoryImage} /> : ""}
                                    <span>{item.categoryName}</span>
                                </div>
                            </Tooltip>
                        ))}
                        {subcategorydata.map(item => (
                            <Tooltip title={item.subCategoryName}>
                                <div onClick={() => { this.subcategoryclicknext(item.subCategoryGuid, item.subCategoryName) }} className={this.props.prevValue === item.subCategoryName ? "active product_detail_box" : "product_detail_box"}>
                                    {item.subCategoryImage != null && item.subCategoryImage != "" ?
                                        <img src={getAWSUrl() + 'CategoryIcons/' + item.subCategoryImage} /> : ""}
                                    <span>{item.subCategoryName}</span>
                                </div>
                            </Tooltip>
                        ))}
                        {/* {ProductTypedata.map(item => (
                            item.productTypeImage !== null?
                            <Tooltip title={item.productTypeName}>
                            <div onClick={()=>{this.ProductTypeclicknext(item.productTypeGuid, item.productTypeName)}} className="product_detail_box">
                                <img src={'https://shoptupperware.in/pub/media/catalog/product/cache/2c0e6a0325b097a382818e3bed70f329/1/1/11149314_1.jpg'} />
                            </div>
                             </Tooltip>
                            :
                            <Tooltip title={item.productTypeName}>
                            <div onClick={()=>{this.ProductTypeclicknext(item.productTypeGuid)}} className="product_detail_box">
                                <span>{item.productTypeName}</span>
                            </div>
                            </Tooltip>
                        ))} */}
                        {/* <div onClick={this.props.next} className="product_detail_box">
                            <img src={'https://shoptupperware.in/pub/media/catalog/product/cache/2c0e6a0325b097a382818e3bed70f329/1/1/11149314_1.jpg'} />
                            <span>Water Bottle</span>
                        </div>
                        <div onClick={this.props.next} className="product_detail_box">
                            <span>Water Bottle</span>
                        </div> */}
                    </div>
                </div>
                <div className="rfq_action">
                    {/* {this.props.name == "Commodity" && <Button onClick={() => this.props.back()} blackBtnSimple>Prev </Button>}
                    {this.props.name == "Category" && <Button onClick={() => this.props.back(selectedCommodity)} blackBtnSimple>Prev</Button>}
                    {this.props.name == "Material Type" && <Button onClick={() => this.props.back(SelectedCategory)} blackBtnSimple>Prev </Button>} */}
                    {this.props.name == "Commodity" && <Button onClick={() => this.props.back()} className="outline_btn_new prev_btn_arrow">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "goback"; })[0], "Prev") : ""} </Button>}
                    {this.props.name == "Category" && <Button onClick={() => this.props.back(selectedCommodity)} className="outline_btn_new prev_btn_arrow">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "goback"; })[0], "Prev") : ""}</Button>}
                    {this.props.name == "Material Type" && <Button onClick={() => this.props.back(SelectedCategory)} className="outline_btn_new prev_btn_arrow">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "goback"; })[0], "Prev") : ""} </Button>}
                    {/* {this.props.name == "Material Type" && <Button onClick={() => this.props.back(selectedCommodity)} blackBtnSimple>Prev subcare</Button>} */}
                    {/* <Button orangeSubmit>Proceed</Button> */}
                </div>
            </div>
        )
    }
}
export default SelectProductDetails
