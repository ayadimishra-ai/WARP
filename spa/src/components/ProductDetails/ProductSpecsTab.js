
import withStyles from "@material-ui/core/styles/withStyles";
import React, { Component } from 'react';
import javascriptStyles from "../../assets/jss/material-kit-pro-react/views/componentsSections/javascriptStyles";
// import div from '../Material/Grid/div.jsx';
// import div from '../Material/Grid/div.jsx';
let selectedProductCertifications = '';
class ProductSpecsTab extends Component {
    // constructor(props) {
    //     super(props)

    // }
    render() {
        let SkuVolumn = "";
        if (this.props.ListProductVariant != undefined || this.props.ListProductVariant != null) {
            SkuVolumn = this.props.ListProductVariant.filter(x => x.skuGuid === this.props.SkuGuid).length > 0 ? this.props.ListProductVariant.filter(x => x.skuGuid === this.props.SkuGuid)[0]['skuVolume'] : "";
        }

        const Resources = this.props.Resources;
        var resArr = [];
        const b = [];
        for (var key in this.props.ListProductSpecification) {
            b.push({ value: this.props.ListProductSpecification[key].groupName });
        }
        b.forEach(function (item) {
            var i = resArr.findIndex(x => x.value === item.value);
            if (i <= -1) {
                resArr.push({ value: item.value });
            }
        });
        var groupNames = resArr;
        // let MaterialList = '';
        // if (this.props.Material !== undefined) {
        //     for (let count = 0; count < this.props.Material.length; count++) {
        //         MaterialList += this.props.Material[count] + ','
        //     }
        //     MaterialList = MaterialList.slice(0, -1)
        // }
        let MaterialList = null;
        if (this.props.Material !== null && this.props.Material !== "" && this.props.Material !== undefined) {
            MaterialList = this.props.Material.split("|").join(',');
        }

        let categoryList = [];
        let categoryName = [];
        let subCategory = [];
        let productType = [];
        categoryList = this.props.Category;
        if (categoryList !== undefined) {
            for (let count = 0; count < categoryList.length; count++) {
                if (categoryList[count]["categoryname.raw"] !== undefined) {
                    categoryName.push(categoryList[count]["categoryname.raw"])
                }
                if (categoryList[count]["subcategoryname.raw"] !== undefined) {
                    subCategory.push(categoryList[count]["subcategoryname.raw"])
                }
                if (categoryList[count]["producttypename.raw"] !== undefined) {
                    productType.push(categoryList[count]["producttypename.raw"])
                }
            }
        }

        if (this.props.ProductCertifications !== undefined) {
            //console.log(this.props.ProductCertifications);
            // let productCertifications = '';
            // for (let i = 0; i < this.props.ProductCertifications.length; i++) {
            //     productCertifications = productCertifications + this.props.ProductCertifications[i] + ', '
            // }
            // productCertifications = productCertifications.slice(0, -2)
            selectedProductCertifications = this.props.ProductCertifications
        }

        return (
            //<React.Fragment>
            //    <div className="prod_specs">
            //        <div style={{ margin: 0 }} >
            //            {/* {this.props.commodityName === '' || this.props.commodityName === undefined ? '' :  <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Commodity Name</div></div> <div className="prod_detail_spec_tab" md={6}><div>{this.props.commodityName}</div></div></React.Fragment>} 
            //                        {categoryName !== '' && categoryName.length > 0 ? <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Category</div></div> <div className="prod_detail_spec_tab" md={6}><div>{categoryName}</div></div></React.Fragment>: ""}
            //                        {subCategory !== '' && subCategory.length > 0 ? <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Sub Category</div></div> <div className="prod_detail_spec_tab" md={6}><div>{subCategory}</div></div></React.Fragment>: ""}
            //                        {productType !== '' && productType.length > 0 ? <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Product Type</div></div><div className="prod_detail_spec_tab" md={6}><div>{productType}</div></div></React.Fragment> : ""}   */}
            //            {this.props.Brand === '' || this.props.Brand === undefined ? '' : <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Brand</div></div> <div className="prod_detail_spec_tab" md={6}><div>{this.props.Brand}</div></div></React.Fragment>}
            //            {(MaterialList === '' || MaterialList === undefined || MaterialList === null) ? '' : <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Material</div></div> <div className="prod_detail_spec_tab" md={6}><div>{MaterialList}</div></div></React.Fragment>}
            //            {/* {this.props.Length === null || this.props.Length === undefined || this.props.DimensionUnit === null || this.props.DimensionUnit === undefined ? '' :  <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Length </div></div> <div className="prod_detail_spec_tab" md={6}><div>{this.props.Length} {this.props.DimensionUnit}</div></div></React.Fragment>} 
            //                        {this.props.Width === null || this.props.Width === undefined || this.props.DimensionUnit === null || this.props.DimensionUnit === undefined ? '' :  <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Width</div></div> <div className="prod_detail_spec_tab" md={6}><div>{this.props.Width} {this.props.DimensionUnit}</div></div></React.Fragment>} 
            //                        {this.props.Height === null || this.props.Height === undefined  || this.props.DimensionUnit === null || this.props.DimensionUnit === undefined ? '' :  <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Height</div></div> <div className="prod_detail_spec_tab" md={6}><div>{this.props.Height} {this.props.DimensionUnit}</div></div></React.Fragment>} 
            //                        {this.props.Weight === null || this.props.Weight === undefined || this.props.WeightUnit === null || this.props.WeightUnit === undefined ? '' :  <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Weight</div></div> <div className="prod_detail_spec_tab" md={6}><div>{this.props.Weight} {this.props.WeightUnit}</div></div></React.Fragment>}  */}
            //            {this.props.Volume === '' || this.props.Volume === undefined || this.props.VolumeUnit === null || this.props.VolumeUnit === undefined ? '' : <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Volume</div></div> <div className="prod_detail_spec_tab" md={6}><div>{this.props.Volume} {this.props.VolumeUnit}</div></div></React.Fragment>}
            //            {/* {this.props.VolumeUnit === null || this.props.VolumeUnit === undefined ? '' :  <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Volume Unit</div></div> <div className="prod_detail_spec_tab" md={6}><div>{this.props.VolumeUnit}</div></div></React.Fragment>} 
            //                        {this.props.WeightUnit === null || this.props.WeightUnit === undefined ? '' :  <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Weight Unit</div></div> <div className="prod_detail_spec_tab" md={6}><div>{this.props.WeightUnit}</div></div></React.Fragment>} 
            //                        {this.props.DimensionUnit === null || this.props.DimensionUnit === undefined ? '' :  <React.Fragment><div className="prod_detail_spec_tab" md={6}><div>Dimension Unit</div></div> <div className="prod_detail_spec_tab" md={6}><div>{this.props.DimensionUnit}</div></div></React.Fragment>}                                     */}
            //        </div>
            //        {/*{groupNames.map(gName => (*/}
            //        {/*    <React.Fragment>*/}
            //        {/*        */}{/* <b>{gName.value}</b> */}
            //        {/*        {this.props.ListProductSpecification.filter(x => x.groupName === gName.value).map(data => (*/}
            //        {/*            //<p>{data.groupKey} :</p>*/}
            //        {/*            <div style={{ margin: 0 }} className="prod_detail_spec_tab">*/}
            //        {/*                <div md={6}>{data["groupkey.raw"]}</div>*/}
            //        {/*                <div md={6}>{data["value.raw"]}</div>*/}
            //        {/*            </div>*/}

            //        {/*        ))}*/}
            //        {/*    </React.Fragment>*/}
            //        {/*))}*/}
            //        <React.Fragment>
            //            {/* <b>{gName.value}</b> */}
            //            {this.props.ListProductSpecification.map(data => {
            //                let alldetails = (<div style={{ margin: 0 }} className="prod_detail_spec_tab">
            //                    <div md={6}>{data["groupkey.raw"]}</div>
            //                    <div md={6}>{data["value.raw"]}</div>
            //                </div>
            //                )
            //                return alldetails;
            //            })}
            //        </React.Fragment>
            //        {this.props.GreenProperties !== undefined && this.props.GreenProperties.length > 0 ?
            //            <div style={{ margin: 0 }} className="prod_detail_spec_tab">
            //                <div md={6}>{"Green Properties"}</div>
            //                <div md={6}>{this.props.GreenProperties.split('|').join(',')}</div>
            //            </div> : ''}
            //        {this.props.SupplierAccreditations !== undefined && this.props.SupplierAccreditations.length > 0 ?
            //            <div style={{ margin: 0 }} className="prod_detail_spec_tab">
            //                <div md={6}>{"Supplier Accreditations"}</div>
            //                <div md={6}>{this.props.SupplierAccreditations.join(',')}</div>
            //            </div> : ''}
            //        {this.props.CarbonEmission !== undefined && this.props.CarbonEmission !== null && this.props.CarbonEmission !== '' ?
            //            <div style={{ margin: 0 }} className="prod_detail_spec_tab">
            //                <div md={6}>{getLabelText(this.props.Resources.filter((x) => { return x.resourceKey === 'carbonemission' })[0], "Carbon FootPrint")}</div>
            //                <div md={6}>{this.props.CarbonEmission}</div>
            //            </div> : ''}
            //        {this.props.ProductCertifications !== undefined && this.props.ProductCertifications !== null && this.props.ProductCertifications !== '' ?
            //            <div style={{ margin: 0 }} className="prod_detail_spec_tab">
            //                <div md={6}>{"Product Certifications"}</div>
            //                <div md={6}>{String(selectedProductCertifications).indexOf("|") > -1 ? String(selectedProductCertifications).split('|').join(', ') : selectedProductCertifications.join(', ')}</div>
            //            </div> : ''}
            //    </div>
            //</React.Fragment>
            <React.Fragment>
                <div className="prod_specs">
                    <React.Fragment>
                        {this.props.ListProductSpecification.map(data => {
                            let alldetails = (<div style={{ margin: 0 }} className="prod_detail_spec_tab">
                                <div md={6}>{data["groupkey.raw"]}</div>
                                <div md={6}>{data["value.raw"]}</div>
                            </div>
                            )
                            return alldetails;
                        })}
                    </React.Fragment>
                </div>
            </React.Fragment>
        )
    }
}

export default withStyles(javascriptStyles)(ProductSpecsTab);