import Done from "@material-ui/icons/Done";
import queryString from "query-string";
import React, { Component } from "react";
import { getAWSUrl } from '../../config';
import * as RoleCodes from "../../rolecodes";
import Button from "../../UI/Button/MaterialButton";
import GridContainer from "../Material/Grid/GridContainer";
import GridItem from "../Material/Grid/GridItem.jsx";

//let commoditydata = [];
let tempcategoryName = "";
const temporaryholdinginfo = [];
class SelectProductInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            commodityGuid: null,
            commodityDetails: [],
            categoryDetails: [],
            subCategoryDetails: [],
            productTypeDetails: [],
            EnterpriseDetails: null,
            selectedCommodity: [],
            selectedCategory: [],
            selectedSubCategory: [],
            selectedProductType: [],
            finalProductInfoDetail: [],
            finalProductInfoDetailPassingAPI: [],
            nextToErrorMsg: ''
        }
    }
    async componentDidMount() {
        if (this.props.commodityData !== undefined) {
            this.setState({ commodityDetails: this.props.commodityData });
        }
        if (this.props.categoryData !== undefined) {
            await this.setState({ categoryDetails: this.props.categoryData });
        }
        if (this.props.subCategoryData !== undefined) {
            this.setState({ subCategoryDetails: this.props.subCategoryData });
        }
        if (this.props.productTypeData !== undefined) {
            this.setState({ productTypeDetails: this.props.productTypeData });
        }
        if (this.props.selectedCommodity !== undefined) {
            let selectedData = this.props.selectedCommodity;
            if (this.props.selectedCommodity.length !== 0) {
                this.setState({ selectedCommodity: this.props.selectedCommodity });
            }
        }
        if (this.props.selectedCategory !== undefined) {
            if (this.props.selectedCategory.length !== 0) {
                this.setState({ selectedCategory: this.props.selectedCategory });
            }
        }
        if (this.props.selectedSubCategory !== undefined) {
            if (this.props.selectedSubCategory.length !== 0) {
                this.setState({ selectedSubCategory: this.props.selectedSubCategory });
            }
        }
        if (this.props.selectedProductType !== undefined) {
            if (this.props.selectedProductType.length !== 0) {
                this.setState({ selectedProductType: this.props.selectedProductType });
            }
        }

    }

    commodityclicknext = (commodityGuid, commodityName) => {
        const { next = f => f } = this.props;
        var data = this.state.commodityDetails;
        // let selectedCommodity = data.filter(x => x.isSelected === true).map(filtereditem => (filtereditem.productClassificationGuid));
        let selectedCommodity = this.state.selectedCommodity;
        //if (selectedCommodity.length > 0) {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
        next(selectedCommodity, commodityName);
        // }
        // else {
        //     this.setState({ nextToErrorMsg: 'Select atleast one commodity type' })
        // }
    }

    Categoryclicknext = (categoryGuid, categoryName) => {
        const { next = f => f } = this.props;
        var data = this.state.selectedCategory;
        let anySelected = false;
        let categoryData = this.state.categoryDetails;
        categoryData.map(x => {
            x.categoryDetails.map(subitem => {
                if (subitem.isSelected) {
                    anySelected = true;
                }
            });
        });
        if (anySelected) {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            next(data, categoryName);
        }
        else {
            this.setState({ nextToErrorMsg: 'Select atleast one category' })
            // confirmAlert({
            //     message: 'Select atleast one category',
            //     buttons: [
            //         {
            //             label: 'OK'
            //         }
            //     ]
            // });
        }
    }

    subcategoryclicknext = (subcategoryGuid, subCategoryName) => {
        const { next = f => f } = this.props;
        var data = this.state.selectedSubCategory;
        let anySelected = false;
        let subCategoryData = this.state.subCategoryDetails;
        subCategoryData.map(x => {
            x.categoryDetails.map(subitem => {
                subitem.subCategoryDetails.map(sub => {
                    if (sub.isSelected) {
                        anySelected = true;
                    }
                });
            });
        });
        if (anySelected) {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            next(data, subCategoryName);
        }
        else {
            this.setState({ nextToErrorMsg: 'Select atleast one sub category' })
            // confirmAlert({
            //     message: 'Select atleast one sub category',
            //     buttons: [
            //         {
            //             label: 'OK'
            //         }
            //     ]
            // });
        }
    }
    producttypeclicknext = (subcategoryGuid, subCategoryName) => {
        const { next = f => f } = this.props;
        var data = this.state.selectedProductType;
        let anySelected = false;
        let productTypeData = this.state.productTypeDetails;
        productTypeData.map(x => {
            x.categoryDetails.map(subitem => {
                subitem.subCategoryDetails.map(sub => {
                    sub.productTypeDetail.map(pt => {
                        if (pt.isSelected) {
                            anySelected = true;
                        }
                    });
                });
            });
        });
        const proudcttypedata = [];
        for (let i = 0; i < data.length; i++) {
            this.state.finalProductInfoDetail.filter(items => items.producttypeguid == data[i]).map(newitem => {
                proudcttypedata.push(newitem);
            })
        };
        if (anySelected) {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            next(proudcttypedata, subCategoryName);

        } else {
            this.setState({ nextToErrorMsg: 'Select atleast one product type' })
        }

    }
    commodityclickprev = (event) => {
        const { back = f => f } = this.props;
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
        back();
    }
    Categoryclickprev = (commodityGuid, commodityName) => {
        const { back = f => f } = this.props;
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
        back();
    }
    subcategoryclickprev = (commodityGuid, commodityName) => {
        const { back = f => f } = this.props;
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
        back();
    }
    producttypeclickprev = (commodityGuid, commodityName) => {
        const { back = f => f } = this.props;
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
        back();
    }
    selectComodities = (event, inputIdentifier) => {
        var data = this.state.commodityDetails;
        var selecteddata = this.state.selectedCommodity;
        var UpdatedcommodityDetails = data.map((item) => {
            if (item.productClassificationGuid === inputIdentifier) {
                if (item.isSelected) {
                    item.isSelected = false;
                    let arr = selecteddata.filter(function (item) {
                        return item !== inputIdentifier
                    })
                    selecteddata = arr;
                } else {
                    item.isSelected = true;
                    selecteddata.push(inputIdentifier)

                }
            }
            return item;
        });
        this.setState({ commodityDetails: UpdatedcommodityDetails, selectedCommodity: selecteddata, nextToErrorMsg: '' });
        localStorage.setItem('SRMcomment', 'false')
    }
    selectCategories = (event, productClassificationGuid, inputIdentifier) => {
        var data = this.state.categoryDetails;
        let subcategoryDetails = [];
        var selecteddata = this.state.selectedCategory;
        var UpdatedcategoryDetails = data.map(x => {
            if (x.productClassificationGuid === productClassificationGuid) {
                let subcate = x.categoryDetails.map(subitem => {
                    if (subitem.categoryGuid === inputIdentifier) {
                        if (subitem.isSelected) {
                            subitem.isSelected = false;
                            let arr = selecteddata.filter(function (item) {
                                return item !== inputIdentifier
                            })
                            selecteddata = arr;
                        } else {
                            subitem.isSelected = true;
                            selecteddata.push(inputIdentifier)
                        }
                    }
                    return subitem;
                });
                x.categoryDetails = subcate;

            }
            return x;
        });
        this.setState({ categoryDetails: UpdatedcategoryDetails, selectedCategory: selecteddata, nextToErrorMsg: '' });
        localStorage.setItem('SRMcomment', 'false')
    }
    selectSubCategories = (event, productClassificationGuid, categoryGuid, inputIdentifier) => {
        var data = this.state.subCategoryDetails;
        var selecteddata = this.state.selectedSubCategory;
        var UpdatedsubCategoryDetails = data.map(x => {
            if (x.productClassificationGuid === productClassificationGuid) {
                //let subcate = 
                x.categoryDetails.map(subitem => {
                    if (subitem.categoryGuid === categoryGuid) {
                        let subCate = subitem.subCategoryDetails.map(sub => {
                            if (sub.subCategoryGuid === inputIdentifier) {
                                if (sub.isSelected) {
                                    sub.isSelected = false;
                                    let arr = selecteddata.filter(function (item) {
                                        return item !== inputIdentifier
                                    })
                                    selecteddata = arr;
                                } else {
                                    sub.isSelected = true;
                                    selecteddata.push(inputIdentifier)
                                }
                            }
                        });
                        return subCate;
                    }
                    //return subitem;
                });
                //x.categoryDetails = subcate;

            }
            return x;
        });
        this.setState({ subCategoryDetails: UpdatedsubCategoryDetails, selectedSubCategory: selecteddata, nextToErrorMsg: '' });
        localStorage.setItem('SRMcomment', 'false')
    }
    selectProductTypes = (event, productClassificationGuid, categoryGuid, subcategoryGuid, inputIdentifier) => {
        var data = this.state.productTypeDetails;
        var selecteddata = this.state.selectedProductType;
        var UpdatedproductTypeDetails = data.map(x => {
            if (x.productClassificationGuid === productClassificationGuid) {
                x.categoryDetails.map(subitem => {
                    if (subitem.categoryGuid === categoryGuid) {
                        subitem.subCategoryDetails.map(sub => {
                            if (sub.subCategoryGuid === subcategoryGuid) {
                                let subproductType = sub.productTypeDetail.map(pt => {
                                    if (pt.productGuid === inputIdentifier) {
                                        if (pt.isSelected) {
                                            pt.isSelected = false;
                                            let arr = selecteddata.filter(function (item) {
                                                return item !== inputIdentifier
                                            })
                                            selecteddata = arr;
                                            let indexofproducttype = temporaryholdinginfo.indexOf(inputIdentifier);
                                            if (indexofproducttype > -1) {
                                                temporaryholdinginfo.splice(indexofproducttype, 1);
                                            }
                                        } else {
                                            pt.isSelected = true;
                                            selecteddata.push(inputIdentifier)
                                            let indexofproducttype = temporaryholdinginfo.filter(item => item.producttypeguid == inputIdentifier).length;
                                            if (indexofproducttype == 0) {
                                                temporaryholdinginfo.push({
                                                    commodityguid: productClassificationGuid,
                                                    categoryGuid: categoryGuid,
                                                    subcategoryGuid: subcategoryGuid,
                                                    producttypeguid: inputIdentifier,
                                                }
                                                )
                                            }
                                            this.setState({ finalProductInfoDetail: temporaryholdinginfo });
                                        }
                                    }
                                });
                                return subproductType;
                            }
                        });
                    }
                });

            }
            return x;
        });
        this.setState({ productTypeDetails: UpdatedproductTypeDetails, selectedProductType: selecteddata, nextToErrorMsg: '' });
        localStorage.setItem('SRMcomment', 'false')
    }
    productTypeWiseSelectAll = (event, productClassificationGuid, categoryGuid, subCategoryGuid, status) => {
        
        var data = this.state.productTypeDetails;
        var selecteddata = this.state.selectedProductType;
        var UpdatedproductTypeDetails = data.map(x => {
            if (x.productClassificationGuid === productClassificationGuid) {
                x.categoryDetails.map(subitem => {
                    if (subitem.categoryGuid === categoryGuid) {
                        subitem.subCategoryDetails.map(sub => {
                            if (sub.subCategoryGuid === subCategoryGuid) {
                                let subproductType = sub.productTypeDetail.map(pt => {
                                    pt.isSelected = status;
                                });
                                return subproductType;
                            }
                        });
                    }
                });

            }
            return x;
        });
        this.setState({ productTypeDetails: UpdatedproductTypeDetails, selectedProductType: selecteddata, nextToErrorMsg: '' });
        localStorage.setItem('SRMcomment', 'false')
    }
    render() {
        let awsURL = getAWSUrl();
        let userType = null;
        if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
            userType= JSON.parse(localStorage.userType);
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            userType= JSON.parse(localStorage.userType);
        } else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            let params = queryString.parse(window.location.search);
            if (params.Rolename.toUpperCase() === RoleCodes.BUYER) {
                userType=  params.Rolename.toUpperCase();
            }
            if (params.Rolename.toUpperCase() === RoleCodes.SUPPLIER) {
                userType=  params.Rolename.toUpperCase();
            }
        }
        return (
            <div className="product_info_form">
                <div className="subTitle_header"><p>
                    {this.props.name == "commodities" && userType === RoleCodes.BUYER && "Thats great, now lets understand your requirements in detail"}
                    {this.props.name == "commodities" && userType === RoleCodes.SUPPLIER && "Thats great, now lets understand your product offering in detail"}
                    {this.props.name == "categories" && userType === RoleCodes.BUYER && "You are doing good, lets detail your requirements further"}
                    {this.props.name == "categories" && userType === RoleCodes.SUPPLIER && "You are doing good, lets detail your product offerings further"}
                    {this.props.name == "subcategories" && userType === RoleCodes.BUYER && "You are doing good, lets detail your requirements further"}
                    {this.props.name == "subcategories" && userType === RoleCodes.SUPPLIER && "You are doing good, lets detail your product offerings further"}
                    {this.props.name == "product types" && userType === RoleCodes.BUYER && "You are doing good, lets detail your requirements further"}
                    {this.props.name == "product types" && userType === RoleCodes.SUPPLIER && "You are doing good, lets detail your product offerings further"}
                    </p>
                    {
                        <span>Select {this.props.name} that you deal in </span>
                    }
                </div>
                <div>

                    {/* {this.props.targetMarket ?
                        <p>Select your target regions that your served </p> :
                        <p>Select commodities that you deal in </p>
                    } */}
                    {/* <div className="product_info_top">
                        {this.props.targetMarket ? <h6> Asia Pacific : 13 countries </h6> : <h6>{'Commodiy'} &gt; {'Category'} &gt; {'Subcategory'}</h6>}
                        {this.props.targetMarket ? <Button orangeSubmit>Select All</Button> : ''}
                    </div> */}
                    <GridContainer>
                        {this.state.commodityDetails.length > 0 ?
                            this.state.commodityDetails.map(item => (
                                <GridItem className="prod_info_list_blocks_main" md={2} sm={3} xs={4}>
                                    <div onClick={(event) => this.selectComodities(event, item.productClassificationGuid)} className="prod_info_list_blocks">
                                        <div className="icons_list_block">
                                            <div>
                                                {item.commodityIcon === null ? '' : <img src={awsURL + "CommodityIcons/" + item.commodityIcon} />}
                                                <p>{item.productClassificationName}</p>
                                            </div>
                                            <div>
                                                {item.isSelected ? <Done /> : ""}
                                            </div>
                                        </div>
                                    </div>
                                </GridItem>
                            ))
                            : ""}
                        {this.state.categoryDetails.length > 0 ?
                            this.state.categoryDetails.map((item, index) => (
                                <>
                                    <GridItem md={12}>
                                        <div className="product_info_top"><h6>{item.productClassificationName} </h6></div>
                                    </GridItem>

                                    {item.categoryDetails.map(subitem => (
                                        <GridItem className="prod_info_list_blocks_main" md={2} sm={3} xs={4}>
                                            <div onClick={(event) => this.selectCategories(event, item.productClassificationGuid, subitem.categoryGuid)} className="prod_info_list_blocks">
                                                {/* <span>{subitem.categoryName}</span>
                                                {subitem.isSelected ? <Done /> : ""} */}
                                                <div className="icons_list_block">
                                                    <div>
                                                        {subitem.categoryIcon === null ? '' : <img src={awsURL + "CategoryIcons/" + subitem.categoryIcon} />}
                                                        <p>{subitem.categoryName}</p>
                                                    </div>
                                                    <div>
                                                        {subitem.isSelected ? <Done /> : ""}
                                                    </div>
                                                </div>
                                            </div>

                                        </GridItem>
                                    ))
                                    }
                                </>
                            ))
                            : ""}
                        {this.state.subCategoryDetails.length > 0 ?
                            this.state.subCategoryDetails.map((item, index) => (
                                //{
                                item.categoryDetails.map((subitem, index) => (
                                    <>
                                        <GridItem md={12}>
                                            <div className="product_info_top"><h6>{item.productClassificationName} &gt; {subitem.categoryName} </h6></div>
                                        </GridItem>
                                        {subitem.subCategoryDetails.map(subCategory => (

                                            <GridItem className="prod_info_list_blocks_main" md={2} sm={3} xs={4}>
                                                <div onClick={(event) => this.selectSubCategories(event, item.productClassificationGuid, subitem.categoryGuid, subCategory.subCategoryGuid)} className="prod_info_list_blocks">
                                                    {/* <span>{subCategory.subCategoryName}</span>
                                                    {subCategory.isSelected ? <Done /> : ""} */}
                                                    <div className="icons_list_block">
                                                        <div>
                                                            {subCategory.subCategoryIcon === null ? '' : <img src={awsURL + "CategoryIcons/" + subCategory.subCategoryIcon} />}
                                                            <p>{subCategory.subCategoryName}</p>
                                                        </div>
                                                        <div>
                                                            {subCategory.isSelected ? <Done /> : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                            </GridItem>

                                        ))}
                                    </>
                                ))
                                // }

                            ))
                            : ""}


                        {this.state.productTypeDetails.length > 0 ?

                            this.state.productTypeDetails.map((item, index) => (
                                item.categoryDetails.map(subitem => (
                                    subitem.subCategoryDetails.map(subCategory => (
                                        <>
                                            <GridItem md={12}>
                                                <div className="product_info_top"><h6>{item.productClassificationName} &gt; {subitem.categoryName} &gt; {subCategory.subCategoryName} </h6>
                                                    {subCategory.productTypeDetail.length == (subCategory.productTypeDetail.filter(item => item.isSelected == true).length) ?
                                                        <Button onClick={(event) => this.productTypeWiseSelectAll(event, item.productClassificationGuid, subitem.categoryGuid, subCategory.subCategoryGuid, false)} orangeSubmit>Deselect All</Button>
                                                        :
                                                        <Button onClick={(event) => this.productTypeWiseSelectAll(event, item.productClassificationGuid, subitem.categoryGuid, subCategory.subCategoryGuid, true)} orangeSubmit>Select All</Button>
                                                    }
                                                </div>
                                            </GridItem>
                                            {subCategory.productTypeDetail.map(productType => (

                                                <GridItem className="prod_info_list_blocks_main" md={2} sm={3} xs={4}>
                                                    <div onClick={(event) => this.selectProductTypes(event, item.productClassificationGuid, subitem.categoryGuid, subCategory.subCategoryGuid, productType.productGuid)} className="prod_info_list_blocks">
                                                        {/* <span>{productType.productName}</span>
                                                        {productType.isSelected ? <Done /> : ""} */}
                                                        <div className="icons_list_block">
                                                            <div>
                                                                {productType.productIcon === null ? '' : <img src={awsURL + "CategoryIcons/" + productType.productIcon} />}
                                                                <p>{productType.productName}</p>
                                                            </div>
                                                            <div>
                                                                {productType.isSelected ? <Done /> : ""}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </GridItem>

                                            ))}
                                        </>
                                    ))
                                ))
                            ))
                            : ""}

                        <GridItem md={12}>
                            <div className="supp_onboarding_action_btn">
                                {this.props.name == "commodities" && <Button onClick={this.commodityclickprev} className="outline_btn_new">Prev</Button>}
                                {this.props.name == "commodities" && <Button onClick={this.commodityclicknext} className="solid_btn_new">Next</Button>}
                                {this.props.name == "categories" && <Button onClick={this.Categoryclickprev} className="outline_btn_new">Prev</Button>}
                                {this.props.name == "categories" && <Button onClick={this.Categoryclicknext} className="solid_btn_new">Next</Button>}
                                {this.props.name == "subcategories" && <Button onClick={this.subcategoryclickprev} className="outline_btn_new">Prev</Button>}
                                {this.props.name == "subcategories" && <Button onClick={this.subcategoryclicknext} className="solid_btn_new">Next</Button>}
                                {this.props.name == "product types" && <Button onClick={this.producttypeclickprev} className="outline_btn_new">Prev</Button>}
                                {this.props.name == "product types" && <Button onClick={this.producttypeclicknext} className="solid_btn_new">Next</Button>}
                                {this.state.nextToErrorMsg && <div class="newThemeError nextBtnError"><p>{this.state.nextToErrorMsg}</p></div>}
                            </div>
                        </GridItem>
                    </GridContainer>
                </div>
            </div>
            // <div className="product_info_form">
            //     <div>
            //         {this.props.targetMarket ?
            //             <p>Select your target regions that your served </p> :
            //             <p>Select commodities that you deal in </p>
            //         }
            //         <div className="product_info_top">
            //             {this.props.targetMarket ? <h6> Asia Pacific : 13 countries </h6> : <h6>{'Commodiy'} &gt; {'Category'} &gt; {'Subcategory'}</h6>}
            //             {this.props.targetMarket ? <Button orangeSubmit>Select All</Button> : ''}
            //         </div>
            //         <GridContainer>
            //             <GridItem md={2} sm={3} xs={4}>
            //                 <div className="prod_info_list_blocks">
            //                     <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/1200px-Flag_of_India.svg.png" />
            //                     <Done />
            //                 </div>
            //             </GridItem>
            //             <GridItem md={2} sm={3} xs={4}>
            //                 <div className="prod_info_list_blocks">
            //                     <h6>Plastic</h6>
            //                     <Done />
            //                 </div>
            //             </GridItem>
            //             <GridItem md={12}>
            //                 <div className="supp_onboarding_action_btn">
            //                     <Button onClick={this.ProductInfoPrevHandler} className="outline_btn_new">Prev</Button>
            //                     <Button onClick={this.props.stepNext} className="solid_btn_new">Next</Button>
            //                 </div>
            //             </GridItem>
            //         </GridContainer>
            //     </div>
            // </div>
        )
    }
}
export default SelectProductInfo