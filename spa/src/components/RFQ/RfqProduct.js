import axios from "axios";
import React, { Component } from "react";
import { getServiceUrl, getUrlParameter } from "../../config";
import RfqProductSpecificationDetails from "./RfqProductSpecificationDetails";

let responsedata = null;

class RfqProduct extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showNewRfq: true,
            showCommodity: false,
            showCategory: false,
            showMaterial: false,
            showProductSpecificationDetails: false,
            rfqTitle: "",
            commoditydata: [],
            Getcategorizationdata: {},
            selectedCommodity: "",
            SelectedCategory: "",
            SelectedSubCategory: "",
            SelectedProductType: "",
            selectedCommodityName: "",
            SelectedCategoryName: "",
            SelectedSubCategoryName: "",
            SelectedProductTypeName: "",
            RfqProductDetails: null,
            prevCommo: '',
            prevCate: '',
            prevSubCate: '',
            unitGuid: '',
            ispreviousdisabled: false,
            companyGuid: '',
            ProductGuid: '00000000-0000-0000-0000-000000000000',
            deliverylocationcount: 0,
            ProductTypedetails: [],
            isArtworkApplicable: false
        }
    }

    async componentDidMount() {
        let params = getUrlParameter("productguid");
        if (params && params != null) {
            this.setState({
                showNewRfq: false,
                showCommodity: false,
                showCategory: false,
                showSubCategory: false,
                showMaterial: false,
                showProductSpecificationDetails: true
            })
        }
        //await this.getSelectedProductDetails();
        //await this.loadData();
        if (this.props.ProductStepData !== undefined && this.props.ProductStepData !== null) {
            this.setState({
                selectedCommodity: this.props.ProductStepData.selectedCommodity,
                SelectedCategory: this.props.ProductStepData.SelectedCategory,
                SelectedSubCategory: this.props.ProductStepData.SelectedSubCategory,
                SelectedProductType: this.props.ProductStepData.SelectedProductType,
                selectedCommodityName: this.props.ProductStepData.selectedCommodityName,
                SelectedCategoryName: this.props.ProductStepData.SelectedCategoryName,
                SelectedSubCategoryName: this.props.ProductStepData.SelectedSubCategoryName,
                RfqProductDetails: this.props.ProductStepData.RfqProductDetails,
                SelectedProductTypeName: this.props.ProductStepData.SelectedProductTypeName,
                showNewRfq: false,
                showCommodity: false,
                showCategory: false,
                showSubCategory: false,
                showMaterial: false,
                showProductSpecificationDetails: true
            });
        }
        if (this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData !== null) {
            await this.getSelectedProductDetails(this.props.NewRfqStepData.SelectedProductType);
            this.setState({
                rfqTitle: this.props.NewRfqStepData.rfqTitle,
                ProductTypedata: this.props.NewRfqStepData.ProductTypedata,
                isArtworkApplicable: this.props.NewRfqStepData.isArtworkApplicable,
                // selectedCommodity: this.props.ProductStepData.selectedCommodity,
                // SelectedCategory: this.props.ProductStepData.SelectedCategory,
                // SelectedSubCategory: this.props.ProductStepData.SelectedSubCategory,
                // SelectedProductType: this.props.ProductStepData.SelectedProductType,
                // selectedCommodityName: this.props.ProductStepData.selectedCommodityName,
                // SelectedCategoryName: this.props.ProductStepData.SelectedCategoryName,
                // SelectedSubCategoryName: this.props.ProductStepData.SelectedSubCategoryName,
                SelectedProductTypeName: this.props.NewRfqStepData.SelectedProductTypeName,
                unitGuid: this.props.NewRfqStepData.unitGuid,
                companyGuid: this.props.NewRfqStepData.companyGuid,
                ProductGuid: this.props.NewRfqStepData.ProductGuid,
                //RfqProductDetails: this.props.ProductStepData.RfqProductDetails,
                showNewRfq: false,
                showCommodity: false,
                showCategory: false,
                showSubCategory: false,
                showMaterial: false,
                showProductSpecificationDetails: true
            });
            // if (this.props.ProductStepData.length > 0) {
            //     this.setState({
            //         selectedCommodity: this.props.ProductStepData.selectedCommodity,
            //         SelectedCategory: this.props.ProductStepData.SelectedCategory,
            //         SelectedSubCategory: this.props.ProductStepData.SelectedSubCategory,
            //         SelectedProductType: this.props.ProductStepData.SelectedProductType,
            //         selectedCommodityName: this.props.ProductStepData.selectedCommodityName,
            //         SelectedCategoryName: this.props.ProductStepData.SelectedCategoryName,
            //         SelectedSubCategoryName: this.props.ProductStepData.SelectedSubCategoryName,
            //         SelectedProductTypeName: this.props.ProductStepData.SelectedProductTypeName,
            //         RfqProductDetails: this.props.ProductStepData.RfqProductDetails,
            //         showNewRfq: false,
            //         showCommodity: false,
            //         showCategory: false,
            //         showSubCategory: false,
            //         showMaterial: false,
            //         showProductSpecificationDetails: true
            //     });
            // }
        }

    }
    getSelectedProductDetails = async (productTypeGuid) => {
        let config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                productGuid: productTypeGuid,
            }
        };
        axios
            .get(getServiceUrl() + "Product/GetDynamicCategoryData", config)
            .then((secondresponse) => {
                var selectedCommodity = "";
                var SelectedCategory = "";
                var SelectedSubCategory = "";
                var SelectedProductType = "";
                selectedCommodity = this.getDynamicCategoryData(secondresponse.data.table1, "commodity");
                SelectedCategory = this.getDynamicCategoryData(secondresponse.data.table1, "category");
                SelectedSubCategory = this.getDynamicCategoryData(secondresponse.data.table1, "subcategory");
                SelectedProductType = this.getDynamicCategoryData(secondresponse.data.table1, "producttype");

                this.setState({
                    selectedCommodity: selectedCommodity !== "" ? selectedCommodity.categoryGuid : "",
                    selectedCommodityName: selectedCommodity !== "" ? selectedCommodity.categoryName : "",
                    SelectedCategory: SelectedCategory !== "" ? SelectedCategory.categoryGuid : "",
                    SelectedCategoryName: SelectedCategory !== "" ? SelectedCategory.categoryName : "",
                    SelectedSubCategory: SelectedSubCategory !== "" ? SelectedSubCategory.categoryGuid : "",
                    SelectedSubCategoryName: SelectedProductType !== "" ? SelectedSubCategory.categoryName : "",
                    SelectedProductType: SelectedProductType !== "" ? SelectedProductType.categoryGuid : "",
                    SelectedProductTypeName: SelectedProductType != "" ? SelectedProductType.categoryName : "",
                });
            }).catch((err) => { console.log(err) });
    }

    loadData = async () => {
        let config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                companyguid: localStorage.companyGuid,
            }
        };

        await axios
            .get(getServiceUrl() + "Rfq/GetAllCategorizationNew", config)
            .then((response) => {
                this.setState({ ProductTypedetails: response.data.productTypeDetails });
                responsedata = response.data.productTypeDetails;
                let params = getUrlParameter("productguid");
                if (params && params != null) {
                    config = {
                        headers: {
                            Authorization: "Bearer " + localStorage.tokenId,
                            "Content-Type": "application/json",
                            productguid: params,
                        }
                    };
                    axios
                        .get(getServiceUrl() + "Product/GetProductDetails", config)
                        .then((secondresponse) => {
                            // let ProductTypedata = Getcategorizationdata.listCommodity.filter((item) => item.commodityGuid === secondresponse.data.table1[0].productClassificationGuid)[0].listCategory.filter((categoryitem) => categoryitem.categoryGuid === secondresponse.data.table1[0].categoryGuid)[0].listSubCategory.filter((subcategoryitem) => subcategoryitem.subCategoryGuid === secondresponse.data.table1[0].subCategoryGuid)[0].listProductType.filter((ProductTypeitem) => ProductTypeitem.productTypeGuid).map(({ productTypeGuid, productTypeName, productTypeImage }) => ({ productTypeGuid, productTypeName, productTypeImage }));
                            if (this.props.ProductStepData !== undefined && this.props.ProductStepData !== null) {
                                this.setState({
                                    RfqProductDetails: this.props.ProductStepData.RfqProductDetails,
                                });
                            }
                            let isArtworkApplicable = responsedata.filter(x => x.categoryGuid === secondresponse.data.table1[0].productClassificationGuid).map(item => (item.isArtworkApplicable))
                            let ProductTypedata = [{
                                categoryGuid: secondresponse.data.table1[0].productTypeGuid,
                                categoryName: secondresponse.data.table1[0].productTypeName
                            }]

                            this.setState({
                                ProductGuid: params,
                                rfqTitle: secondresponse.data.table1[0].productName,
                                selectedCommodity: secondresponse.data.table1[0].productClassificationGuid,
                                SelectedCategory: secondresponse.data.table1[0].categoryGuid,
                                SelectedSubCategory: secondresponse.data.table1[0].subCategoryGuid,
                                SelectedProductType: secondresponse.data.table1[0].productTypeGuid,
                                selectedCommodityName: secondresponse.data.table1[0].productClassificationName,
                                SelectedCategoryName: secondresponse.data.table1[0].categoryName,
                                SelectedSubCategoryName: secondresponse.data.table1[0].subCategoryName,
                                SelectedProductTypeName: secondresponse.data.table1[0].productTypeName,
                                ispreviousdisabled: true,
                                unitGuid: secondresponse.data.table1[0].unitGuid,
                                companyGuid: secondresponse.data.table1[0].companyGuid,
                                ProductTypedata: ProductTypedata,
                                showNewRfq: false,
                                showCommodity: false,
                                showCategory: false,
                                showSubCategory: false,
                                showMaterial: false,
                                showProductSpecificationDetails: true,
                                isArtworkApplicable: isArtworkApplicable !== undefined ? isArtworkApplicable.length > 0 ? isArtworkApplicable[0] : false : false
                            });
                        }).catch((err) => { console.log(err) });
                }
            });
        // await axios
        //     .get(getServiceUrl() + "Rfq/GetAllCategorization", config)
        //     .then((response) => {
        //         let Getcategorizationdata = response.data;
        //         let commodity = Getcategorizationdata.listCommodity.filter((item) => item.commodityName).map(({ commodityGuid, commodityName, isArtworkApplicable, categoryImage }) => ({ commodityGuid, commodityName, isArtworkApplicable, categoryImage}));
        //         this.setState({ commoditydata: commodity, Getcategorizationdata: Getcategorizationdata, deliverylocationcount : response.data.deliveryLocationCount })
        //         let params = getUrlParameter("productguid");
        //         if (params && params != null) {
        //             config = {
        //                 headers: {
        //                     Authorization: "Bearer " + localStorage.tokenId,
        //                     "Content-Type": "application/json",
        //                     productguid: params,
        //                 }
        //             };
        //             axios
        //                 .get(getServiceUrl() + "Product/GetProductDetails", config)
        //                 .then((secondresponse) => {
        //                     let ProductTypedata = Getcategorizationdata.listCommodity.filter((item) => item.commodityGuid === secondresponse.data.table1[0].productClassificationGuid)[0].listCategory.filter((categoryitem) => categoryitem.categoryGuid === secondresponse.data.table1[0].categoryGuid)[0].listSubCategory.filter((subcategoryitem) => subcategoryitem.subCategoryGuid === secondresponse.data.table1[0].subCategoryGuid)[0].listProductType.filter((ProductTypeitem) => ProductTypeitem.productTypeGuid).map(({ productTypeGuid, productTypeName, productTypeImage }) => ({ productTypeGuid, productTypeName, productTypeImage }));
        //                     if (this.props.ProductStepData !== undefined && this.props.ProductStepData !== null) {
        //                         this.setState({
        //                             RfqProductDetails: this.props.ProductStepData.RfqProductDetails,
        //                         });
        //                     }
        //                     this.setState({                                
        //                         ProductGuid: params,
        //                         rfqTitle: secondresponse.data.table1[0].productName,
        //                         selectedCommodity: secondresponse.data.table1[0].productClassificationGuid,
        //                         SelectedCategory: secondresponse.data.table1[0].categoryGuid,
        //                         SelectedSubCategory: secondresponse.data.table1[0].subCategoryGuid,
        //                         SelectedProductType: secondresponse.data.table1[0].productTypeGuid,
        //                         selectedCommodityName: secondresponse.data.table1[0].productClassificationName,
        //                         SelectedCategoryName: secondresponse.data.table1[0].categoryName,
        //                         SelectedSubCategoryName: secondresponse.data.table1[0].subCategoryName,
        //                         SelectedProductTypeName: secondresponse.data.table1[0].productTypeName,
        //                         ispreviousdisabled: true,
        //                         unitGuid: secondresponse.data.table1[0].unitGuid,
        //                         companyGuid: secondresponse.data.table1[0].companyGuid,
        //                         ProductTypedata: ProductTypedata,
        //                         showNewRfq: false,
        //                         showCommodity: false,
        //                         showCategory: false,
        //                         showSubCategory: false,
        //                         showMaterial: false,
        //                         showProductSpecificationDetails: true
        //                     });
        //                 }).catch((err) => { console.log(err) });

        //         }
        //     })
        //     .catch((err) => { console.log(err) }
        //     );
    }

    showNewRfqFn = () => {
        this.setState({ showNewRfq: true, showCommodity: false, showCategory: false, showMaterial: false, showProductSpecificationDetails: false });
    }
    showCommodityFn = (Data) => {
        this.setState({ rfqTitle: Data.rfqTitle, ProductTypedata: Data.ProductTypedata, SelectedProductTypeName: Data.SelectedProductTypeName, isArtworkApplicable: Data.isArtworkApplicable, showNewRfq: false, showCommodity: false, showCategory: false, showMaterial: false, showProductSpecificationDetails: true });
    }

    showCommodityFnBck = (value) => {
        // alert(value)
        this.setState({ prevCommo: value, selectedCommodity: "", showNewRfq: false, showCommodity: true, showCategory: false, showSubCategory: false, showMaterial: false, showProductSpecificationDetails: false });
    }

    showCategoryFn = (Data, Name) => {
        let Getcategorizationdata = this.state.Getcategorizationdata;
        let categorydata = Getcategorizationdata.listCommodity.filter((item) => item.commodityGuid === Data)[0].listCategory.filter((categoryitem) => categoryitem).map(({ categoryGuid, categoryName, categoryImage }) => ({ categoryGuid, categoryName, categoryImage }));
        this.setState({ selectedCommodity: Data, selectedCommodityName: Name, categorydata: categorydata, showNewRfq: false, showCommodity: false, showCategory: false, showSubCategory: false, showMaterial: false, showProductSpecificationDetails: true });
    }

    showCategoryFnBack = (value) => {
        // alert(value)
        let Getcategorizationdata = this.state.Getcategorizationdata;
        let newcommodityname = this.state.selectedCommodityName;
        this.state.categorydata = Getcategorizationdata.listCommodity.filter((item) => item.commodityName === newcommodityname)[0].listCategory.map(({ categoryGuid, categoryName, categoryImage }) => ({ categoryGuid, categoryName, categoryImage }));;
        this.setState({ prevCate: value, categorydata: this.state.categorydata, SelectedCategory: this.state.SelectedCategoryName, showNewRfq: false, showCommodity: true, showCategory: false, showSubCategory: false, showMaterial: false, showProductSpecificationDetails: false });
    }

    // showSubCategoryFn = (Data, Name) => {
    //     let Getcategorizationdata = this.state.Getcategorizationdata;
    //     let subcategorydata = Getcategorizationdata.listCommodity.filter((item) => item.commodityGuid === this.state.selectedCommodity)[0].listCategory.filter((categoryitem) => categoryitem.categoryGuid === Data)[0].listSubCategory.filter((subcategoryitem) => subcategoryitem.subCategoryGuid).map(({ subCategoryGuid, subCategoryName, subCategoryImage }) => ({ subCategoryGuid, subCategoryName, subCategoryImage }));
    //     this.setState({ SelectedCategory: Data, SelectedCategoryName: Name, subcategorydata: subcategorydata, showNewRfq: false, showCommodity: false, showCategory: false, showSubCategory: true, showMaterial: false, showProductSpecificationDetails: false });
    // }

    // showSubCategoryFnBack = (value) => {
    //     let Getcategorizationdata = this.state.Getcategorizationdata;
    //     let SelectedCategory = this.state.SelectedCategory;
    //     let newcommodityname = this.state.selectedCommodityName;
    //     this.state.subcategorydata = Getcategorizationdata.listCommodity.filter((item) => item.commodityName === newcommodityname)[0].listCategory.filter((item2) => item2.categoryGuid === SelectedCategory)[0].listSubCategory.map(({ subCategoryGuid, subCategoryName, subCategoryImage }) => ({ subCategoryGuid, subCategoryName, subCategoryImage }));

    //     //.listCategory.
    //     this.setState({ prevSubCate: value, subcategorydata: this.state.subcategorydata, SelectedSubCategoryName: this.state.selectedCommodityName, showNewRfq: false, showCommodity: false, showCategory: false, showSubCategory: true, showMaterial: false, showProductSpecificationDetails: false });
    // }

    // showMaterialFn = (Data, Name) => {
    //     let Getcategorizationdata = this.state.Getcategorizationdata;
    //     let ProductTypedata = Getcategorizationdata.listCommodity.filter((item) => item.commodityGuid === this.state.selectedCommodity)[0].listCategory.filter((categoryitem) => categoryitem.categoryGuid === this.state.SelectedCategory)[0].listSubCategory.filter((subcategoryitem) => subcategoryitem.subCategoryGuid === Data)[0].listProductType.filter((ProductTypeitem) => ProductTypeitem.productTypeGuid).map(({ productTypeGuid, productTypeName, productTypeImage }) => ({ productTypeGuid, productTypeName, productTypeImage }));
    //     this.setState({ SelectedSubCategory: Data, SelectedSubCategoryName: Name, ProductTypedata: ProductTypedata, showNewRfq: false, showCommodity: false, showCategory: false, showSubCategory: false, showMaterial: false, showProductSpecificationDetails: true });
    // }

    showProductSpecificationDetailsFn = (Data) => {
        let Getcategorizationdata = this.state.Getcategorizationdata;
        // let ProductTypedata = Getcategorizationdata.listCommodity.filter((item) => item.commodityGuid === this.state.selectedCommodity)[0].listCategory.filter((categoryitem) => categoryitem.categoryGuid === Data).map(({ subCategoryGuid, subCategoryName, subCategoryImage }) => ({ subCategoryGuid, subCategoryName, subCategoryImage }));
        this.setState({ SelectedProductType: Data, showNewRfq: false, showCommodity: false, showCategory: false, showSubCategory: false, showMaterial: false, showProductSpecificationDetails: true });
    }

    opennextstep = (Data) => {
        const { stepNext = f => f } = this.props;
        let RfqProductDetails = Data;
        this.setState({ RfqProductDetails: RfqProductDetails });
        const maindata = {
            rfqTitle: this.state.rfqTitle,
            selectedCommodity: this.state.selectedCommodity,
            selectedCommodityName: this.state.selectedCommodityName,
            SelectedCategory: this.state.SelectedCategory,
            SelectedCategoryName: this.state.SelectedCategoryName,
            SelectedSubCategory: this.state.SelectedSubCategory,
            SelectedSubCategoryName: this.state.SelectedSubCategoryName,
            SelectedProductTypeName: this.state.SelectedProductTypeName,
            RfqProductDetails: Data.RfqProductDetails,
            SelectedTransportation: Data.SelectedTransportation,
            SelectedSkuGuid: Data.SelectedSkuGuid,
            SelectedSkuVariants: Data.SelectedSkuVariants,
            tquantityUnittype: Data.tquantityUnittype,
            tweight: Data.tweight,
            tweightunit: Data.tweightunit,
            tweightunitguid: Data.tweightunitguid,
        }
        stepNext(maindata, "SpecificationStep");
    }

    getDynamicCategoryData = (tableData, CategoryType) => {
        var categorydeails = "";
        if (tableData !== undefined && tableData !== null) {
            tableData.map((item, index) => {
                if (index === 0) {
                    if (CategoryType === "commodity") {
                        categorydeails = { categoryName: item.categoryName, categoryGuid: item.categoryGuid }
                    }
                } else if (index === 1) {
                    if (CategoryType === "category") {
                        categorydeails = { categoryName: item.categoryName, categoryGuid: item.categoryGuid }
                    }
                } else if (index === (tableData.length - 1)) {
                    if (CategoryType === "producttype") {
                        categorydeails = { categoryName: item.categoryName, categoryGuid: item.categoryGuid }
                    }
                } else {
                    if (CategoryType === "subcategory") {
                        if (categorydeails != "") {
                            categorydeails = categorydeails + ">" + item.categoryName
                            categorydeails = { categoryName: item.categoryName, categoryGuid: item.categoryGuid }
                        }
                        else {
                            categorydeails = item.categoryName
                            categorydeails = { categoryName: item.categoryName, categoryGuid: item.categoryGuid }
                        }
                    }
                }
            });
        }
        return categorydeails;
    }

    render() {
        return (
            <div>
                {/* {this.state.showNewRfq && <NewRfq showCommodityClick={this.showCommodityFn} rfqTitle={this.state.rfqTitle} ProductTypedetails={this.state.ProductTypedetails} />} */}
                {/* {this.state.showCommodity && <RfqSelectProductDetails prevValue={this.state.prevCommo} back={this.showNewRfqFn} next={this.showCategoryFn} commodityData={this.state.commoditydata} name={'Commodity'} getCommodityData={this.getCommodityData} />} */}
                {/* {this.state.showCategory && <RfqSelectProductDetails prevValue={this.state.prevCate} back={this.showCommodityFnBck} next={this.showSubCategoryFn} categorydata={this.state.categorydata} selectedCommodity={this.state.selectedCommodityName} name={'Category'} getCategoryData={this.getCategoryData} />}
                {this.state.showSubCategory && <RfqSelectProductDetails prevValue={this.state.prevSubCate} back={this.showCategoryFnBack} next={this.showMaterialFn} subcategorydata={this.state.subcategorydata} selectedCommodity={this.state.selectedCommodityName} SelectedCategory={this.state.SelectedCategoryName} name={'Material Type'} />} */}
                {/* {this.state.showMaterial && <RfqSelectProductDetails back={this.showSubCategoryFnBack} next={this.showProductSpecificationDetailsFn} ProductTypedata={this.state.ProductTypedata} materialType={'Material'} />} */}
                {this.state.showProductSpecificationDetails && <RfqProductSpecificationDetails
                    back={this.props.stepBack}
                    stepNext={this.opennextstep}
                    ispreviousdisabled={this.state.ispreviousdisabled}
                    ProductGuid={this.state.ProductGuid}
                    unitGuid={this.state.unitGuid}
                    deliverylocationcount={this.state.deliverylocationcount}
                    companyGuid={this.state.companyGuid}
                    ProductTypedata={this.state.ProductTypedata}
                    RfqProductDetailsData={this.state.RfqProductDetails}
                    selectedCommodity={this.state.selectedCommodityName}
                    SelectedProductType={this.state.SelectedProductType}
                    SelectedCategory={this.state.SelectedCategoryName}
                    SelectedSubCategory={this.state.SelectedSubCategoryName}
                    commodityData={this.state.commoditydata}
                    SelectedProductTypeName={this.state.SelectedProductTypeName}
                    isArtworkApplicable={this.state.isArtworkApplicable}
                    SelectedTransportation={this.props.SelectedTransportation}
                    NewRfqStepData={this.props.NewRfqStepData}
                    isCatelogRFQ={this.props.isCatelogRFQ}
                    exactProductDetail={this.props.exactProductDetail}
                    virtualSampleData={this.props.virtualSampleData}
                    NewSelectedSkuGuid={this.props.NewSelectedSkuGuid} />}

            </div>
        )
    }
}
export default RfqProduct