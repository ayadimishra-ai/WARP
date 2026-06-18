import React, { Component } from 'react';
import Clear from '@material-ui/icons/Clear';
import withStyles from "@material-ui/core/styles/withStyles";
import styles from "../../assets/jss/material-kit-pro-react/customSelectStyle";
import axios from 'axios';
import { getWebsiteUrl, getElasticSearchCredentials, getLabelText, getServiceUrl, getGlobalSettings } from '../../config';
import Input from '../../UI/Input/MaterialInput';
import { Link } from "react-router-dom";
import NewReleases from "@material-ui/icons/NewReleases";
import Label from "@material-ui/icons/Label";
import RemoveCircle from "@material-ui/icons/RemoveCircle";
import { dateFormat } from 'highcharts';
import Button from "../../UI/Button/MaterialButton";
import { confirmAlert } from 'react-confirm-alert';
import ProductGreenProperties from '../../components/ProductDetails/ProductGreenProperties';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import MuiDialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Popover from '@material-ui/core/Popover';
import { ExpandMore } from '@material-ui/icons';
import Tooltip from '@material-ui/core/Tooltip';
import ProductDetailTab from '../ProductDetails/ProductDetailTab';
import {convertintokg } from '../../utility';
import Spinner from '../../UI/Spinner/Spinner';

let greenproperties = null;
let lowestTransportEmission = [];
let lowestCarbonEmission = [];
let lowestPlasticWeight = [];
let lowestLeadTime = [];
let lowestPrice = [];
let lowestMoq = [];
let highestescore = [];
let highestsscore = [];
let highestgscore = [];
let urlRes = [];
let PriceOffOffset = 17
let usdtoinr = 80
let oneTonne = 1000
const awsUrl = getWebsiteUrl();
const initialState = {
    productDropdown: {
        productList: {
            elementType: 'select',
            elementConfig: {
                options: [],
                // label: 'Select Products',
            },
            value: '',
            validation: {},
            valid: true,
            label: 'Select Products',
        },
    },
}
let returnvaluearray = [];
let pricelead = [];
let stateproductguid = [];
let decimalValue = 2;
let qtyperunitvalue = 0;
const decimalPrecision = () => {
    getGlobalSettings("DECIMALPRECISION").then(function (result) {
        if (result !== undefined) {
            decimalValue = result.data.hits.hits[0]._source.settingsValue;
        }
    });
};
let isfilterlength = true;
let isgreaterthanmaxorderqty = false;
class CompareProduct extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialState,
            simpleSelect: "",
            multipleSelect: [],
            ProductList: [],
            ProductListShow: [],
            ProductListSelection: [],
            result: [],
            ProductListSelectionCount: 0,
            showdropdown: true,
            mainProductData: [],
            showPreference: null,
            showProductCount: 0,
            savingsDataArray: [],
            selectedProductGrade: '',
            selectedProductGreenProperties: '',
            selectedProductAccreditations: '',
            selectedProductCarbonEmission: '',
            selectedProductCertifications: '',
            carbonEmissionDetails: [],
            productqty: 0,
            newThemeError: "",
            CarbonEmission: '',
            CarbonEmissionUnit: '',
            priceqty: 0,
            leadtimeqty: 0,
            isblank: true,
            orderby: '',
            open: false,
            popupimage: '',
            productTransportEmission: [],
            anchorEl: null,
            currentProductGuid: '',
            DefaultProductListShow: []
        };
    }

    handleClickOpen = (popupimagesrc) => {
        this.setState({
            open: true,
            popupimage: popupimagesrc
        });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    handleSimple = event => {
        if (event.target.value !== "0") {
            this.setState({ [event.target.name]: event.target.value });

            let selectedProductGuid = event.target.value;
            if (this.state.productDropdown !== undefined) {
                this.setState({ showProductCount: this.state.showProductCount + 1 });
                if (this.state.productDropdown.productList.elementConfig.options.length > 0 && this.state.ProductListShow.length > 1) {
                    this.setState({ showdropdown: true });
                }
                else {
                    this.setState({ showdropdown: false });
                }
                // if (this.state.ProductListSelectionCount !== 1) {
                this.setState({ ProductListSelectionCount: (this.state.ProductListSelectionCount - 1) });
                //}
                const updatedproductDropdown = { ...this.state.productDropdown };
                const array = { ...this.state.productDropdown };
                let PArray = this.state.productDropdown.productList.elementConfig.options.filter(x => x.Id === selectedProductGuid)
                for (var i in array.productList.elementConfig.options) {
                    if (array.productList.elementConfig.options[i].Id === PArray[0].Id) {
                        array.productList.elementConfig.options.splice(i, 1);
                        updatedproductDropdown.productList.elementConfig.options = array.productList.elementConfig.options;
                        this.setState({ productDropdown: updatedproductDropdown });
                        break;
                    }
                }
            }
            if (this.state.ProductListShow !== undefined) {
                let productArray = [];
                productArray = this.state.ProductList.filter(x => x.productGuid === event.target.value)
                this.setState({
                    ProductListShow: [...this.state.ProductListShow, productArray[0]],
                }, () => {
                });

                let data = [];
                let productArraySort = [];
                data = this.state.ProductListShow;
                data.push(productArray[0])
                if (this.state.showPreference === 'showMinPrice') {
                    productArraySort = data.sort((a, b) => (a.priceqty - b.priceqty));
                }
                else if (this.state.showPreference === 'showLeadTime') {
                    productArraySort = data.sort((a, b) => (a.leadTime - b.leadTime));
                }
                else if (this.state.showPreference === 'showReview') {
                    productArraySort = data.sort((a, b) => (a.ratings - b.ratings));
                }
                else if (this.state.showPreference === 'showMOQ') {
                    productArraySort = data.sort((a, b) => (a.moq - b.moq));
                }
                else if (this.state.showPreference === 'showCFprint') {
                    //                productArraySort = data.sort((a, b) => (a.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSKUGuid)[0].carbonEmission - b.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSKUGuid)[0].carbonEmission));
                    productArraySort = data.sort((a, b) => (a.carbonEmission - b.carbonEmission));
                }
                //else if (this.state.showPreference === 'showCCperkg') {
                //    productArraySort = data.sort((a, b) => (a.carbonCost - b.carbonCost));
                //}
                //else if (this.state.showPreference === 'showCAcperkg') {
                //    productArraySort = data.sort((a, b) => (a.carbonAdjustedCost - b.carbonAdjustedCost));
                //}
                this.setState({ ProductListShow: productArraySort });
            }
        }
    };
    getCompareProductData(text, defaultValue, valueList, filterColumn, dropdownBottomTD, unitvalue, lastvalue, ratecard, isselected) {
        let data = [];
        let ifdataExist = false;
        let anyData = false;
        if (valueList.length > 0) {
            data.push(<td><span dangerouslySetInnerHTML={{ __html: text }}></span></td>)
            // if (filterColumn == "carbonAdjustedCost" || filterColumn == "carbonCost" || filterColumn == "carbonEmission") {
            //     //  let origianlvalue = defaultValue.replace(lastvalue, "").trim();
            //     let origianlvalue = defaultValue;
            //     data.push(<td className={isselected ? "selected_comparetd" : ""}>{defaultValue == '' || defaultValue == null || defaultValue == undefined || origianlvalue === "0" ? '-' : unitvalue}<span dangerouslySetInnerHTML={{ __html: defaultValue }}></span></td>)
            // }
            // else if (filterColumn == "minPrice") {
            //     data.push(<td className={isselected ? "selected_comparetd" : ""}>{this.state.isblank ? this.props.ProductPrice === 0 ? defaultValue : unitvalue + ' ' + defaultValue : this.state.priceqty > 0 ? unitvalue + ' ' + defaultValue : defaultValue}</td>)
            // }
            // else if (filterColumn == "mOQ") {
            //     data.push(<td className={isselected ? "selected_comparetd" : ""}>{defaultValue}</td>)
            // }
            // else {
            //     data.push(<td className={isselected ? "selected_comparetd" : ""}>{defaultValue == '' || defaultValue == null || defaultValue == undefined || defaultValue === "0" ? '-' : unitvalue + ' ' + defaultValue}</td>)
            // }
            if (filterColumn == "carbonAdjustedCost" || filterColumn == "carbonCost" || filterColumn == "carbonEmission") {

                valueList.map((x, i) => {
                    if (x.listRateCardVM.length > 0) {
                        if (x.listRateCardVM.filter(y => y.isDefault == true).length > 0) {
                            let defaultskuguid = x.listRateCardVM.filter(y => y.isDefault == true)[0].skuGuid;
                            ifdataExist = x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0][filterColumn] === '' || x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0][filterColumn] == undefined || x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0][filterColumn] == 0 ? false : true;
                            ifdataExist = defaultValue === null || defaultValue === '' || defaultValue === undefined || defaultValue === 0 ? false : true
                            if (ifdataExist) {
                                if (this.props.quantityname == "Gram" || this.props.quantityname == "Kilogram" || this.props.quantityname == "Pieces" || this.props.quantityname === "Pound" || this.props.quantityname === "Metric Tonnes") {
                                    if (!anyData) {
                                        anyData = true;
                                    }
                                }
                                if (x.skuGuid == defaultskuguid) {
                                    if (x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0][filterColumn] === '' ||
                                        x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0][filterColumn] === undefined ||
                                        x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0][filterColumn] === 0) {

                                        if (x.productGuid === this.props.ProductGuid) {
                                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>NA</td>)
                                        }
                                        else {
                                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>NA</td>)
                                        }
                                    }
                                    else {
                                        if (this.state.isblank === false) {
                                            if (x.carbonemissionqty !== undefined || x.carbonemissionqty > 0) {
                                                if (lowestCarbonEmission.filter(z => z == x.productGuid).length > 0) {
                                                    if (x.productGuid === this.props.ProductGuid) {
                                                        data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><b style={{ background: "#73DED4" }}>
                                                            {String(x.carbonemissionqty.toFixed(2))} <span dangerouslySetInnerHTML={{ __html: lastvalue }}></span></b>
                                                        </td>)
                                                    }
                                                    else {
                                                        data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><b style={{ background: "#73DED4" }}>
                                                            {String(x.carbonemissionqty.toFixed(2))} <span dangerouslySetInnerHTML={{ __html: lastvalue }}></span></b>
                                                        </td>)
                                                    }
                                                }
                                                else {
                                                    if (x.productGuid === this.props.ProductGuid) {
                                                        data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>
                                                            {String(x.carbonemissionqty.toFixed(2))} <span dangerouslySetInnerHTML={{ __html: lastvalue }}></span>
                                                        </td>)
                                                    }
                                                    else {
                                                        data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>
                                                            {String(x.carbonemissionqty.toFixed(2))} <span dangerouslySetInnerHTML={{ __html: lastvalue }}></span>
                                                        </td>)
                                                    }
                                                }
                                            }
                                            else {
                                                if (x.productGuid === this.props.ProductGuid) {
                                                    data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>-</td>)
                                                }
                                                else {
                                                    data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>-</td>)
                                                }
                                            }
                                        }
                                        else {
                                            if (lowestCarbonEmission.filter(z => z == x.productGuid).length > 0) {
                                                if (x.productGuid === this.props.ProductGuid) {
                                                    data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><b style={{ background: "#73DED4" }}>
                                                        {String(x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0][filterColumn]).indexOf("|") > -1 ?
                                                            String(x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0][filterColumn]).split("|").join(", ")
                                                            : x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0][filterColumn]} <span dangerouslySetInnerHTML={{ __html: lastvalue }}></span>
                                                    </b></td>)
                                                }
                                                else {
                                                    data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><b style={{ background: "#73DED4" }}>
                                                        {String(x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0][filterColumn]).indexOf("|") > -1 ?
                                                            String(x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0][filterColumn]).split("|").join(", ")
                                                            : x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0][filterColumn]} <span dangerouslySetInnerHTML={{ __html: lastvalue }}></span>
                                                    </b></td>)
                                                }
                                            }
                                            else {
                                                if (x.productGuid === this.props.ProductGuid) {
                                                    data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>
                                                        {String(x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0][filterColumn]).indexOf("|") > -1 ?
                                                            String(x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0][filterColumn]).split("|").join(", ")
                                                            : x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0][filterColumn]} <span dangerouslySetInnerHTML={{ __html: lastvalue }}></span>
                                                    </td>)
                                                }
                                                else {
                                                    data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>
                                                        {String(x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0][filterColumn]).indexOf("|") > -1 ?
                                                            String(x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0][filterColumn]).split("|").join(", ")
                                                            : x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0][filterColumn]} <span dangerouslySetInnerHTML={{ __html: lastvalue }}></span>
                                                    </td>)
                                                }
                                            }
                                        }
                                    }
                                }
                                else {
                                    if (x.productGuid === this.props.ProductGuid) {
                                        data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>NA</td>)
                                    }
                                    else {
                                        data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>NA</td>)
                                    }
                                }
                            }
                            else {
                                if (x.productGuid === this.props.ProductGuid) {
                                    data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>NA</td>)
                                }
                                else {
                                    data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>NA</td>)
                                }
                            }

                        }
                        else {
                            if (x.productGuid === this.props.ProductGuid) {
                                data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>NA</td>)
                            }
                            else {
                                data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>NA</td>)
                            }
                        }
                    }
                    else {
                        if (x.productGuid === this.props.ProductGuid) {
                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>NA</td>)
                        }
                        else {
                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>NA</td>)
                        }
                    }
                })
            }
            else {
                valueList.map((x, i) => {
                    if (filterColumn == "plasticWeight") {
                        if (x.listRateCardVM.length > 0) {
                            if (x.listRateCardVM.filter(y => y.isDefault == true).length > 0) {
                                let defaultskuguid = x.listRateCardVM.filter(y => y.isDefault == true)[0].skuGuid;
                                if (x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0].weightUnit != undefined) {
                                    lastvalue = x.listProductVariantsVM.filter(x => x.skuGuid == defaultskuguid)[0].weightUnit
                                }
                            }
                        }
                    }
                    ifdataExist = x[filterColumn] === '' || x[filterColumn] == undefined ? false : true;
                    ifdataExist = defaultValue === null || defaultValue === '' || defaultValue === undefined ? false : true
                    if (ifdataExist) {
                        if (!anyData) {
                            anyData = true;
                        }
                        if (filterColumn == "minPrice") {
                            if (!this.state.isblank) {
                                if (x.greaterthanmoq === true) {
                                    this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                        data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link></td>)
                                        :
                                        data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link></td>)
                                }
                                else {
                                    if (x["priceqty"] === '' || x["priceqty"] === undefined || x["priceqty"] === 0) {
                                        this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link></td>)
                                            :
                                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link></td>)

                                    }
                                    else {
                                        if (lowestPrice.filter(z => z === x.productGuid).length > 0) {
                                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><b style={{ background: "#73DED4" }}>{unitvalue} {x["priceqty"]}</b></td>)
                                        }
                                        else {
                                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>{unitvalue} {x["priceqty"]}</td>)
                                        }
                                    }
                                }
                            }
                            else {
                                if (x[filterColumn] === '' || x[filterColumn] === undefined || x[filterColumn] === 0) {
                                    if (this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length > 0) {
                                        this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link></td>)
                                            :
                                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link></td>)
                                    }
                                    else {
                                        this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link></td>)
                                            :
                                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link></td>)
                                    }
                                }
                                else {
                                    if (x.filterlenght === false) {
                                        if (x.productGuid === this.props.ProductGuid) {
                                            this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link></td>)
                                                :
                                                data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link></td>)
                                        }
                                        else {
                                            this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link></td>)
                                                :
                                                data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link></td>)
                                        }

                                    }
                                    else {
                                        if (x.productGuid === this.props.ProductGuid) {
                                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>{unitvalue} {x.priceqty}</td>)
                                        }
                                        else {
                                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>{unitvalue} {x.priceqty}</td>)
                                        }
                                    }
                                }
                            }
                        }
                        else if (filterColumn == "mOQ") {
                            if (x[filterColumn] === '' || x[filterColumn] === undefined || x[filterColumn] === 0) {
                                this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                    data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link></td>)
                                    :
                                    data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link></td>)
                            }
                            else {
                                this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                    !x.filterlenght ?
                                        lowestMoq.filter(z => z === x.productGuid).length > 0 ?
                                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><b style={{ background: "#73DED4" }}>{unitvalue} {x[filterColumn]}</b></td>)
                                            :
                                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>{unitvalue} {x[filterColumn]}</td>)
                                        :
                                        data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link></td>)
                                    :
                                    !x.filterlenght ?
                                        lowestMoq.filter(z => z === x.productGuid).length > 0 ?
                                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><b style={{ background: "#73DED4" }}>{unitvalue} {x[filterColumn]}</b></td>)
                                            :
                                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>{unitvalue} {x[filterColumn]}</td>)
                                        :
                                        data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link></td>)
                            }
                        }
                        else if (filterColumn == "productCertifications") {
                            let htmlanchor = [];
                            if (x[filterColumn] !== '' || x[filterColumn] !== undefined || x[filterColumn] !== 0) {
                                if (String(x[filterColumn]).indexOf("|") > -1) {
                                    var allcertificates = String(x[filterColumn]).split("|");
                                    allcertificates.map((item, index) => {
                                        this.checkFileExist(item + ".pdf", x.supplierGuid.toUpperCase(), x.productCode);
                                        let urlStatus = urlRes === undefined ? false : urlRes.length > 0 ? urlRes.filter(t => t.certificate == item + ".pdf" && t.supplierGuid.toUpperCase() == x.supplierGuid.toUpperCase() && t.productCode == x.productCode).length > 0 ? urlRes.filter(t => t.certificate == item + ".pdf" && t.supplierGuid.toUpperCase() == x.supplierGuid.toUpperCase() && t.productCode == x.productCode && t.status == true).length > 0 : true : false
                                        urlStatus === true ?
                                            index == (allcertificates.length - 1) ?
                                                htmlanchor.push(<a className="certificateslink" target="_blank" onClick={(event) => this.onDownloadClick(event, item + '.pdf', x.supplierGuid.toUpperCase(), x.productCode)}><span>{item}</span></a>)
                                                :
                                                htmlanchor.push(<a className="certificateslink" target="_blank" onClick={(event) => this.onDownloadClick(event, item + '.pdf', x.supplierGuid.toUpperCase(), x.productCode)}><span>{item}, </span></a>)
                                            :
                                            index == (allcertificates.length - 1) ?
                                                htmlanchor.push(<span>{item}</span>)
                                                :
                                                htmlanchor.push(<span>{item} ,</span>)
                                    })
                                }
                                else {
                                    this.checkFileExist(String(x[filterColumn]) + ".pdf", x.supplierGuid.toUpperCase(), x.productCode);
                                    let urlStatuses = urlRes === undefined ? false : urlRes.length > 0 ? urlRes.filter(t => t.certificate == String(x[filterColumn]) + ".pdf" && t.supplierGuid.toUpperCase() == x.supplierGuid.toUpperCase() && t.productCode == x.productCode).length > 0 ? urlRes.filter(t => t.certificate == String(x[filterColumn]) + ".pdf" && t.supplierGuid.toUpperCase() == x.supplierGuid.toUpperCase() && t.productCode == x.productCode && t.status == true).length > 0 : true : false
                                    urlStatuses === true ?
                                        htmlanchor.push(<a className="certificateslink" target="_blank" onClick={(event) => this.onDownloadClick(event, String(x[filterColumn]) + '.pdf', x.supplierGuid.toUpperCase(), x.productCode)}><span>{x[filterColumn]}</span></a>)
                                        :
                                        htmlanchor.push(<span>{x[filterColumn]}</span>);
                                }
                            }
                            data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>{htmlanchor}</td>)
                        }
                        else {
                            if (lowestTransportEmission.filter(z => z == x.productGuid).length > 0 && filterColumn == "transportEmission") {
                                data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><b style={{ background: "#73DED4" }}>{unitvalue} {x[filterColumn] === '' || x[filterColumn] === undefined || x[filterColumn] === 0 ? '-' : String(x[filterColumn]).indexOf("|") > -1 ? String(x[filterColumn]).split("|").join(", ") + ' ' + lastvalue : <React.Fragment>{x[filterColumn].toFixed(2)}  <span dangerouslySetInnerHTML={{ __html: lastvalue }}></span></React.Fragment>}</b></td>)
                            }
                            else if (filterColumn == "plasticWeight" && lowestPlasticWeight.filter(z => z == x.productGuid).length > 0) {
                                x[filterColumn] > 0 ?
                                    data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}><b style={{ background: "#73DED4" }}>{x[filterColumn] === '' || x[filterColumn] === undefined || x[filterColumn] === 0 ? '-' : convertintokg(lastvalue, x[filterColumn]).toFixed(2)} {x[filterColumn] === '' || x[filterColumn] === undefined || x[filterColumn] === 0 ? null : lastvalue !== undefined && lastvalue !== null ? lastvalue ==="Grams" || lastvalue ==="Kilogram" || lastvalue ==="Pound" || lastvalue ==="Metric Tonnes" ? 'Kg' :  lastvalue: lastvalue}</b></td>)
                                    :
                                    data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>{unitvalue} {x[filterColumn] === '' || x[filterColumn] === undefined || x[filterColumn] === 0 ? '-' : String(x[filterColumn]).indexOf("|") > -1 ? String(x[filterColumn]).split("|").join(", ") + ' ' + lastvalue : <React.Fragment>{convertintokg(lastvalue, x[filterColumn]).toFixed(2)}  <span dangerouslySetInnerHTML={{ __html: lastvalue }}></span></React.Fragment>}</td>)

                            }
                            else {
                                if (filterColumn == "transportEmission") {
                                    data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>{unitvalue} {x[filterColumn] === '' || x[filterColumn] === undefined || x[filterColumn] === 0 ? '-' : String(x[filterColumn]).indexOf("|") > -1 ? String(x[filterColumn]).split("|").join(", ") + ' ' + lastvalue : <React.Fragment>{x[filterColumn].toFixed(2)}  <span dangerouslySetInnerHTML={{ __html: lastvalue }}></span></React.Fragment>}</td>)
                                }
                                else if (filterColumn == "plasticWeight") {
                                    data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>{x[filterColumn] === '' || x[filterColumn] === undefined || x[filterColumn] === 0 ? '-' : convertintokg(lastvalue, x[filterColumn]).toFixed(2)} {x[filterColumn] === '' || x[filterColumn] === undefined || x[filterColumn] === 0 ? null : lastvalue !== undefined && lastvalue !== null ? lastvalue ==="Grams" || lastvalue ==="Kilogram" || lastvalue ==="Pound" || lastvalue ==="Metric Tonnes" ? 'Kg' :  lastvalue: lastvalue}</td>)
                                }
                                else {
                                    data.push(<td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>{unitvalue} {x[filterColumn] === '' || x[filterColumn] === undefined || x[filterColumn] === 0 ? '-' : String(x[filterColumn]).indexOf("|") > -1 ? String(x[filterColumn]).split("|").join(", ") + ' ' + lastvalue : <React.Fragment>{x[filterColumn]}  <span dangerouslySetInnerHTML={{ __html: lastvalue }}></span></React.Fragment>}</td>)
                                }
                            }
                        }

                    }
                })
            }
            if (anyData) {
                return <tr>{data}{dropdownBottomTD}</tr>
            }
            else {
                return null;
            }
        }
        else {
            let value = defaultValue === '' || defaultValue === null || defaultValue == undefined ? false : true;
            if (value) {
                data.push(<td>{text}</td>)
                data.push(<td>{defaultValue}</td>)
                return data;
            }
            else {
                return null;
            }
        }
    }
    handleMultiple = event => {
        this.setState({ multipleSelect: event.target.value });
    };

    componentDidMount() {
        if (this.props.ProductGuid !== undefined) {
            this.setState({ showPreference: 'showMinPrice', productqty: this.props.MOQ })
            let productsData = [];
            let prod = '';
            let ProductShow = [];
            let productArray = [];
            let productListData = this.props.ComparableProductList;
            this.setState({ ProductList: this.props.ComparableProductList })
            productArray = this.props.ComparableProductList;
            if (this.props.ComparableProductList.length > 3) {
                for (let i = 0; i < 3; i++) {
                    ProductShow.push(productListData[i]);
                    productArray = productArray.filter(x => x.productGuid !== productListData[i].productGuid)
                    this.setState({ showProductCount: i + 1 });
                }
                for (let i = 0; i < productArray.length; i++) {

                    prod = { Id: productArray[i].productGuid, Value: productArray[i].productName }
                    productsData.push(prod);
                }
                const updatedproductDropdown = { ...this.state.productDropdown };
                updatedproductDropdown.productList.elementConfig.options = productsData;
                this.setState({ productDropdown: updatedproductDropdown, ProductListSelectionCount: productsData.length });
            }
            else {
                for (let i = 0; i < productListData.length; i++) {
                    ProductShow.push(productListData[i]);
                    productArray = productArray.filter(x => x.productGuid !== productListData[i].productGuid)
                }
                const updatedproductDropdown = { ...this.state.productDropdown };
                updatedproductDropdown.productList.elementConfig.options = productsData;
                if (productArray.length === 0) {
                    this.setState({ productDropdown: updatedproductDropdown, ProductListSelectionCount: productsData.length });
                }
                else {
                    this.setState({ productDropdown: updatedproductDropdown, ProductListSelectionCount: productsData.length });
                }
            }
            if (productArray.filter(x => x.productGuid == this.props.ProductGuid).length > 0) {
                ProductShow.push(productArray.filter(x => x.productGuid == this.props.ProductGuid)[0]);
                productsData = productsData.filter(x => x.Id !== this.props.ProductGuid);
                const updatedproductDropdown = { ...this.state.productDropdown };
                updatedproductDropdown.productList.elementConfig.options = productsData;
                this.setState({ productDropdown: updatedproductDropdown, ProductListSelectionCount: productsData.length });
            }
            this.setState({ ProductListShow: ProductShow });
        }
        if (this.props.GradeLevel !== undefined) {
            let productGrade = '';
            for (let i = 0; i < this.props.GradeLevel.length; i++) {
                productGrade = productGrade + this.props.GradeLevel[i] + ', '
            }
            productGrade = productGrade.slice(0, -2)
            this.setState({ selectedProductGrade: productGrade })
        }

        if (this.props.GreenProperties !== undefined) {
            let productGreenProperty = '';
            for (let i = 0; i < this.props.GreenProperties.length; i++) {
                productGreenProperty = productGreenProperty + this.props.GreenProperties[i] + ', '
            }
            productGreenProperty = productGreenProperty.slice(0, -2)
            this.setState({ selectedProductGreenProperties: productGreenProperty })
        }

        if (this.props.SupplierAccreditations !== undefined) {
            let productAccreditations = '';
            for (let i = 0; i < this.props.SupplierAccreditations.length; i++) {
                productAccreditations = productAccreditations + this.props.SupplierAccreditations[i] + ', '
            }
            productAccreditations = productAccreditations.slice(0, -2)
            this.setState({ selectedProductAccreditations: productAccreditations })
        }

        if (this.props.ProductCertifications !== undefined) {
            let productCertifications = '';
            for (let i = 0; i < this.props.ProductCertifications.length; i++) {
                productCertifications = productCertifications + this.props.ProductCertifications[i] + ', '
            }
            productCertifications = productCertifications.slice(0, -2)
            this.setState({ selectedProductCertifications: productCertifications })
        }

        this.getDataBySelection('', 'CFprint')
    }
    getSavingDetails(quantity) {
        let decimalValue = 2;
        let productListData = this.props.ComparableProductList;
        let productGuid = '';
        let productListDataArray = [];
        let savePerUnit = '', savePerUnit1 = '', saveTotal = '', saveTotal1 = '', ErrMsg = '';
        for (let i = 0; i < productListData.length; i++) {
            let formData = { productGuid: '', savingsPerUnit: '', savings: '' };
            if ((productListData[i].listRateCardVM[0].quantity1 != null && quantity <= productListData[i].listRateCardVM[0].quantity1)) {
                productGuid = productListData[i].listRateCardVM[0].productGuid;
                ErrMsg = 'Minimum Order Quantity is ' + productListData[i].listRateCardVM[0].quantity1;
                savePerUnit1 = productListData[i].listRateCardVM[0].price1 - productListData[i].listRateCardVM[0].price1;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                savePerUnit = productListData[i].listRateCardVM[0].currencySymbol + savePerUnit + '/unit';
                saveTotal = productListData[i].listRateCardVM[0].currencySymbol + saveTotal;
            }
            else if ((productListData[i].listRateCardVM[0].quantity1 != null && quantity >= productListData[i].listRateCardVM[0].quantity1) && (productListData[i].listRateCardVM[0].quantity2 === null || quantity < productListData[i].listRateCardVM[0].quantity2)) {
                productGuid = productListData[i].listRateCardVM[0].productGuid;
                savePerUnit1 = productListData[i].listRateCardVM[0].price1 - productListData[i].price1;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                savePerUnit = productListData[i].listRateCardVM[0].currencySymbol + savePerUnit + '/unit';
                saveTotal = productListData[i].listRateCardVM[0].currencySymbol + saveTotal;
                ErrMsg = '';
            }
            else if ((productListData[i].listRateCardVM[0].quantity2 != null && quantity >= productListData[i].listRateCardVM[0].quantity2) && (productListData[i].listRateCardVM[0].quantity3 === null || quantity < productListData[i].listRateCardVM[0].quantity3)) {
                productGuid = productListData[i].listRateCardVM[0].productGuid;
                savePerUnit1 = productListData[i].listRateCardVM[0].price1 - productListData[i].listRateCardVM[0].price2;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                savePerUnit = productListData[i].listRateCardVM[0].currencySymbol + savePerUnit + '/unit';
                saveTotal = productListData[i].listRateCardVM[0].currencySymbol + saveTotal;
                ErrMsg = '';
            }
            else if ((productListData[i].listRateCardVM[0].quantity3 != null && quantity >= productListData[i].listRateCardVM[0].quantity3) && (productListData[i].listRateCardVM[0].quantity4 === null || quantity < productListData[i].listRateCardVM[0].quantity4)) {
                productGuid = productListData[i].listRateCardVM[0].productGuid;
                savePerUnit1 = productListData[i].listRateCardVM[0].price1 - productListData[i].listRateCardVM[0].price3;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                savePerUnit = productListData[i].listRateCardVM[0].currencySymbol + savePerUnit + '/unit';
                saveTotal = productListData[i].listRateCardVM[0].currencySymbol + saveTotal;
                ErrMsg = '';
            }
            else if ((productListData[i].listRateCardVM[0].quantity4 != null && quantity >= productListData[i].listRateCardVM[0].quantity4) && (productListData[i].listRateCardVM[0].quantity5 === null || quantity < productListData[i].listRateCardVM[0].quantity5)) {
                productGuid = productListData[i].listRateCardVM[0].productGuid;
                savePerUnit1 = productListData[i].listRateCardVM[0].price1 - productListData[i].listRateCardVM[0].price4;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                savePerUnit = productListData[i].listRateCardVM[0].currencySymbol + savePerUnit + '/unit';
                saveTotal = productListData[i].listRateCardVM[0].currencySymbol + saveTotal;
                ErrMsg = '';
            }
            else if ((productListData[i].listRateCardVM[0].quantity5 != null && quantity >= productListData[i].listRateCardVM[0].quantity5) && (productListData[i].listRateCardVM[0].quantity6 === null || quantity < productListData[i].listRateCardVM[0].quantity6)) {
                productGuid = productListData[i].listRateCardVM[0].productGuid;
                savePerUnit1 = productListData[i].listRateCardVM[0].price1 - productListData[i].listRateCardVM[0].price5;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                savePerUnit = productListData[i].listRateCardVM[0].currencySymbol + savePerUnit + '/unit';
                saveTotal = productListData[i].listRateCardVM[0].currencySymbol + saveTotal;
                ErrMsg = '';
            }
            else if ((productListData[i].listRateCardVM[0].quantity6 != null && quantity >= productListData[i].listRateCardVM[0].quantity6) && (productListData[i].listRateCardVM[0].quantity7 === null || quantity < productListData[i].listRateCardVM[0].quantity7)) {
                productGuid = productListData[i].listRateCardVM[0].productGuid;
                savePerUnit1 = productListData[i].listRateCardVM[0].price1 - productListData[i].listRateCardVM[0].price6;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                savePerUnit = productListData[i].listRateCardVM[0].currencySymbol + savePerUnit + '/unit';
                saveTotal = productListData[i].listRateCardVM[0].currencySymbol + saveTotal;
                ErrMsg = '';
            }
            else if ((productListData[i].listRateCardVM[0].quantity7 != null && quantity >= productListData[i].listRateCardVM[0].quantity7) && (productListData[i].listRateCardVM[0].quantity8 === null || quantity < productListData[i].listRateCardVM[0].quantity8)) {
                productGuid = productListData[i].listRateCardVM[0].productGuid;
                savePerUnit1 = productListData[i].listRateCardVM[0].price1 - productListData[i].listRateCardVM[0].price7;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                savePerUnit = productListData[i].listRateCardVM[0].currencySymbol + savePerUnit + '/unit';
                saveTotal = productListData[i].listRateCardVM[0].currencySymbol + saveTotal;
                ErrMsg = '';
            }
            else if ((productListData[i].listRateCardVM[0].quantity8 != null && quantity >= productListData[i].listRateCardVM[0].quantity8) && (productListData[i].listRateCardVM[0].quantity9 === null || quantity < productListData[i].listRateCardVM[0].quantity9)) {
                productGuid = productListData[i].listRateCardVM[0].productGuid;
                savePerUnit1 = productListData[i].listRateCardVM[0].price1 - productListData[i].listRateCardVM[0].price8;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                savePerUnit = productListData[i].listRateCardVM[0].currencySymbol + savePerUnit + '/unit';
                saveTotal = productListData[i].listRateCardVM[0].currencySymbol + saveTotal;
                ErrMsg = '';
            }
            else if ((productListData[i].listRateCardVM[0].quantity9 != null && quantity >= productListData[i].listRateCardVM[0].quantity9) && (productListData[i].listRateCardVM[0].quantity10 === null || quantity < productListData[i].listRateCardVM[0].quantity10)) {
                productGuid = productListData[i].listRateCardVM[0].productGuid;
                savePerUnit1 = productListData[i].listRateCardVM[0].price1 - productListData[i].listRateCardVM[0].price9;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                savePerUnit = productListData[i].listRateCardVM[0].currencySymbol + savePerUnit + '/unit';
                saveTotal = productListData[i].listRateCardVM[0].currencySymbol + saveTotal;
                ErrMsg = '';
            }
            else if (productListData[i].listRateCardVM[0].quantity10 != null && quantity >= productListData[i].listRateCardVM[0].quantity10) {
                productGuid = productListData[i].listRateCardVM[0].productGuid;
                savePerUnit1 = productListData[i].listRateCardVM[0].price1 - productListData[i].listRateCardVM[0].price10;
                savePerUnit = Number(Math.round(savePerUnit1 + 'e2') + 'e-2').toFixed(decimalValue);
                saveTotal1 = quantity * savePerUnit;
                saveTotal = Number(Math.round(saveTotal1 + 'e2') + 'e-2').toFixed(decimalValue);
                savePerUnit = productListData[i].listRateCardVM[0].currencySymbol + savePerUnit + '/unit';
                saveTotal = productListData[i].listRateCardVM[0].currencySymbol + saveTotal;
                ErrMsg = '';
            }
            formData.productGuid = productGuid;
            formData.savingsPerUnit = savePerUnit;
            formData.savings = saveTotal;
            formData.ErrMsg = ErrMsg;
            productListDataArray.push(formData);
        }
        this.setState({ savingsDataArray: productListDataArray })
    }
    async getDataBySelection(event, OrderBy, showtype) {
        this.setState({ orderby: OrderBy });
        if (this.props.ProductGuid !== undefined) {
            if (this.state.ProductListShow.length > 0) {
                let ProductShow = [];
                let preference = '';
                let productArrayShowcount = 0;
                let productArray = [];
                let productArrayShow = [];
                if (showtype == 'replace') {
                    productArray = this.state.ProductListShow.filter(x => x.productGuid !== this.props.ProductGuid);
                    productArrayShow = this.state.ProductListShow.filter(x => x.productGuid !== this.props.ProductGuid);
                }
                else {
                    productArray = this.state.DefaultProductListShow.filter(x => x.productGuid !== this.props.ProductGuid);
                    productArrayShow = this.state.DefaultProductListShow.filter(x => x.productGuid !== this.props.ProductGuid);
                }
                let productArraySort = [];
                let productArraySortShow = [];
                let dropdownData = [];
                if (OrderBy === 'MinPrice') {
                    preference = 'showMinPrice';
                    productArraySort = productArray.sort((a, b) => (a.priceqty - b.priceqty));
                    productArraySortShow = productArrayShow.sort((a, b) => (a.priceqty - b.priceqty));
                }
                else if (OrderBy === 'LeadTime') {
                    preference = 'showLeadTime';
                    productArraySort = productArray.sort((a, b) => (a.leadtimeqty - b.leadtimeqty));
                    productArraySortShow = productArrayShow.sort((a, b) => (a.leadtimeqty - b.leadtimeqty));
                }
                else if (OrderBy === 'Review') {
                    preference = 'showReview';
                    productArraySort = productArray.sort((a, b) => (a.ratings - b.ratings));
                    productArraySortShow = productArrayShow.sort((a, b) => (a.ratings - b.ratings));
                }
                else if (OrderBy === 'MOQ') {
                    preference = 'showMOQ';
                    // productArraySort = productArray.sort((a, b) => (a.moq - b.moq));
                    // productArraySortShow = productArrayShow.sort((a, b) => (a.moq - b.moq));
                    productArraySort = productArray.sort((a, b) => (a.mOQ - b.mOQ));
                    productArraySortShow = productArrayShow.sort((a, b) => (a.mOQ - b.mOQ));
                }
                else if (OrderBy === 'CFprint') {
                    preference = 'showCFprint';
                    productArraySort = productArray.sort((a, b) => (a.carbonemissionqty - b.carbonemissionqty));
                    productArraySortShow = productArrayShow.sort((a, b) => (a.carbonemissionqty - b.carbonemissionqty));
                    let equaltozero = productArraySort.filter(x => x.carbonemissionqty == 0);
                    let greaterzero = productArraySort.filter(x => x.carbonemissionqty > 0);
                    equaltozero.map(item => {
                        greaterzero.push(item)
                    });
                    productArray = greaterzero;
                    productArraySortShow = greaterzero;
                    productArraySort = greaterzero;
                }
                else if (OrderBy === 'CCperkg') {
                    preference = 'showCCperkg';
                    // productArraySort = productArray.sort((a, b) => (a.moq - b.moq));
                    // productArraySortShow = productArrayShow.sort((a, b) => (a.moq - b.moq));
                    productArraySort = productArray.sort((a, b) => (a.carbonCost - b.carbonCost));
                    productArraySortShow = productArrayShow.sort((a, b) => (a.carbonCost - b.carbonCost));
                }
                else if (OrderBy === 'CAcperkg') {
                    preference = 'showCAcperkg';
                    // productArraySort = productArray.sort((a, b) => (a.moq - b.moq));
                    // productArraySortShow = productArrayShow.sort((a, b) => (a.moq - b.moq));
                    productArraySort = productArray.sort((a, b) => (a.carbonAdjustedCost - b.carbonAdjustedCost));
                    productArraySortShow = productArrayShow.sort((a, b) => (a.carbonAdjustedCost - b.carbonAdjustedCost));
                }
                else if (OrderBy === 'pWeight') {
                    preference = 'showpWeight';
                    productArraySort = productArray.sort((a, b) => (a.plasticWeight - b.plasticWeight));
                    productArraySortShow = productArrayShow.sort((a, b) => (a.plasticWeight - b.plasticWeight));
                }
                else if (OrderBy === 'TEprint') {
                    preference = 'showTEprint';
                    productArraySort = productArray.sort((a, b) => (a.transportEmission - b.transportEmission));
                    productArraySortShow = productArrayShow.sort((a, b) => (a.transportEmission - b.transportEmission));
                    let equaltozero = productArraySort.filter(x => x.transportEmission == 0);
                    let greaterzero = productArraySort.filter(x => x.transportEmission > 0);
                    equaltozero.map(item => {
                        greaterzero.push(item)
                    });
                    productArray = greaterzero;
                    productArraySortShow = greaterzero;
                    productArraySort = greaterzero;
                }
                else if (OrderBy === 'Environment') {
                    preference = 'showEnvironment';
                    productArraySort = productArray.sort((a, b) => (b.eScore - a.eScore));
                    productArraySortShow = productArrayShow.sort((a, b) => (b.eScore - a.eScore));
                }
                else if (OrderBy === 'Social') {
                    preference = 'showSocial';
                    productArraySort = productArray.sort((a, b) => (b.sScore - a.sScore));
                    productArraySortShow = productArrayShow.sort((a, b) => (b.sScore - a.sScore));
                }
                else if (OrderBy === 'Governance') {
                    preference = 'showGovernance';
                    productArraySort = productArray.sort((a, b) => (b.gScore - a.gScore));
                    productArraySortShow = productArrayShow.sort((a, b) => (b.gScore - a.gScore));
                }
                if (showtype == 'replace') {
                    this.props.ComparableProductList.map(item => {
                        if (this.state.ProductListShow.filter(items => items.productGuid == item.productGuid).length == 0) {
                            let data = { Id: item.productGuid, Value: item.productName }
                            dropdownData.push(data);
                        }
                    })
                    const updatedproductDropdown = { ...this.state.productDropdown };
                    dropdownData = dropdownData.filter(x => x.Id !== this.props.ProductGuid)
                    updatedproductDropdown.productList.elementConfig.options = dropdownData;

                    let currentproductArray = this.state.ProductListShow.filter(x => x.productGuid === this.props.ProductGuid);
                    ProductShow = ProductShow.concat(currentproductArray);
                    productArraySort.map(item => {
                        ProductShow.push(item)
                    })
                    if (dropdownData.length > 0) {
                        this.setState({ ProductListShow: ProductShow, productDropdown: updatedproductDropdown, ProductListSelectionCount: dropdownData.length, showPreference: preference });
                    }
                    else {
                        this.setState({ ProductListShow: ProductShow, productDropdown: updatedproductDropdown, ProductListSelectionCount: 0, showPreference: preference });
                    }
                }
                else {
                    productArraySort.map(x => {
                        let data = { Id: x.productGuid, Value: x.productName }
                        dropdownData.push(data);
                    })
                    let currentproductArray = this.state.DefaultProductListShow.filter(x => x.productGuid === this.props.ProductGuid);
                    ProductShow = ProductShow.concat(currentproductArray);

                    ProductShow.map(items => {
                        dropdownData = dropdownData.filter(x => x.Id !== items.productGuid)
                    })
                    if (this.props.ComparableProductList.length > 1) {
                        for (let i = 0; i < (parseInt(this.state.ProductListShow.length) - parseInt(1)); i++) {
                                dropdownData = dropdownData.filter(x => x.Id !== dropdownData[0].Id)
                                ProductShow.push(productArraySortShow[i]);
                            }
                        const updatedproductDropdown = { ...this.state.productDropdown };
                        dropdownData = dropdownData.filter(x => x.Id !== this.props.ProductGuid)
                        updatedproductDropdown.productList.elementConfig.options = dropdownData;
                        if (this.props.ComparableProductList.length - ProductShow.length > 0) {
                            this.setState({ isblank: false, productDropdown: updatedproductDropdown, ProductListSelectionCount: this.props.ComparableProductList.length - dropdownData.length - ProductShow.length + 1, ProductListShow: ProductShow, showPreference: preference });
                        }
                        else {
                            this.setState({ isblank: false, productDropdown: updatedproductDropdown, ProductListSelectionCount: 0, ProductListShow: ProductShow, showPreference: preference });
                        }
                    }
                    else {
                        const updatedproductDropdown = { ...this.state.productDropdown };
                        dropdownData = dropdownData.filter(x => x.Id !== this.props.ProductGuid)
                        updatedproductDropdown.productList.elementConfig.options = dropdownData;
                        for (let i = 0; i < 1; i++) {
                            ProductShow.push(productArraySortShow[i]);
                        }
                        let currentproductArray = productArray.filter(x => x.productGuid === this.props.ProductGuid)
                        // ProductShow.push(currentproductArray);
                        if (productArray.length === 2) {
                            ProductShow = ProductShow
                        }
                        else {
                            ProductShow = ProductShow.concat(currentproductArray);
                        }


                        if (this.props.ComparableProductList.length - ProductShow.length > 0) {
                            this.setState({ productDropdown: updatedproductDropdown, ProductListSelectionCount: this.props.ComparableProductList.length - dropdownData.length - ProductShow.length + 1, ProductListShow: ProductShow, showPreference: preference });
                        }
                        else {
                            this.setState({ productDropdown: updatedproductDropdown, ProductListSelectionCount: 0, ProductListShow: ProductShow, showPreference: preference });
                        }
                    }
                }
            }
            else {
                let ProductShow = [];
                let preference = '';
                let productArray = []   //this.props.ComparableProductList;
                let productArrayShow = [] //this.props.ComparableProductList;
                let productArraySort = [];
                let productArraySortShow = [];
                let dropdownData = [];
                let AllAddressList = [];
                let alldata = this.props.ComparableProductList;
                {
                    let defaultsku = '00000000-0000-0000-0000-000000000000';
                    let ratecard = [];
                    let emissionqty = this.props.MOQ;
                    for (let i = 0; i < alldata.length; i++) {
                        defaultsku = alldata[i].listRateCardVM.filter(y => y.isDefault == true).length > 0 ? alldata[i].listRateCardVM.filter(y => y.isDefault == true)[0].skuGuid : '00000000-0000-0000-0000-000000000000';
                        ratecard = alldata[i].listRateCardVM.filter(y => y.isDefault == true);
                        if (ratecard.length > 0) {
                            if (ratecard[0].maximumOrderQuantity < this.state.productqty) {
                                isgreaterthanmaxorderqty = true;
                            }
                            else {
                                isgreaterthanmaxorderqty = false;
                            }
                            if (emissionqty == 0) {
                                this.getpriceacctoquantity(ratecard, this.state.productqty)
                            }
                            else {
                                emissionqty = alldata.filter(x => x.productGuid === alldata[i].productGuid)[0].mOQ
                                this.getpriceacctoquantity(ratecard, emissionqty)
                            }
                            alldata[i].priceqty = pricelead[0].pricing;
                            alldata[i].leadtimeqty = pricelead[0].leadtime;
                            alldata[i].greaterthanmoq = pricelead[0].greaterthanmoq;
                            alldata[i].filterlenght = pricelead[0].filterlenght;
                            alldata[i].plasticWeight = alldata[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku).length > 0 ?
                                (alldata[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].plasticWeight != null || alldata[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].plasticWeight != undefined || alldata[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].plasticWeight != "") ?
                                    parseFloat(alldata[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].plasticWeight) * parseFloat(emissionqty) : 0 : 0;
                            alldata[i].plasticWeightUnit = alldata[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].weightUnit
                            pricelead = [];
                            AllAddressList.push({
                                "OriginGuid": alldata[i].supplierDefaultAddressGuid,
                                "DestinationGuid": alldata[i].buyerDefaultAddressGuid,
                                "Weight": this.props.unitList.filter(x => x.unitGuid === alldata[i].quantityUnitGuid)[0].unitType == "unit" ? parseFloat(alldata[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].weight) * parseFloat(emissionqty) : parseFloat(emissionqty),
                                "WeightUnit": this.props.unitList.filter(x => x.unitGuid === alldata[i].quantityUnitGuid)[0].unitType == "unit" ? alldata[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].weightUnit : this.props.unitList.filter(x => x.unitGuid === alldata[i].quantityUnitGuid)[0].name
                            })
                        }
                        let formbody = {};
                        var config = {
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.tokenId,
                                'Content-Type': 'application/json',
                                'ProductGuid': alldata[i].productGuid,
                                'SkuGuid': defaultsku,
                                'Quantity': emissionqty
                            },
                        };
                        await axios
                            .post(getServiceUrl() + "Product/GetProductCarbonEmissionDetails?", formbody, config)
                            .then((response) => {
                                if (response != null) {
                                    if (response.data.table1.length > 0) {
                                        alldata[i].carbonemissionqty = response.data.table1[0].carbonEmission;
                                        alldata[i].carbonemissionunit = response.data.table1[0].carbonEmissionUnit;
                                    }
                                }
                                else {
                                    alldata[i].carbonemissionqty = 0;
                                    alldata[i].carbonemissionunit = "";
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
                }

                AllAddressList = AllAddressList.filter(a => a.OriginGuid != null && a.OriginGuid != undefined);
                AllAddressList = AllAddressList.filter(a => a.DestinationGuid != null && a.DestinationGuid != undefined);
                if (AllAddressList.length > 0) {
                    {
                        var config = {
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.tokenId,
                                'Content-Type': 'application/json'
                            },
                        };
                        await axios
                            .post(getServiceUrl() + "Rfq/GetTrasnportEmission?", AllAddressList, config)
                            .then((response) => {
                                if (response != null) {
                                    let arrays = [];
                                    if (response.data.status == 200) {
                                        for (let i = 0; i < alldata.length; i++) {
                                            if (response.data.results.filter(a => a.originGuid == alldata[i].supplierDefaultAddressGuid && a.destinationGuid == alldata[i].buyerDefaultAddressGuid).length > 0) {

                                                alldata[i].transportEmission = response.data.results.filter(a => a.originGuid == alldata[i].supplierDefaultAddressGuid && a.destinationGuid == alldata[i].buyerDefaultAddressGuid)[0].transportEmission;
                                                alldata[i].transportEmissionUnit = response.data.results.filter(a => a.originGuid == alldata[i].supplierDefaultAddressGuid && a.destinationGuid == alldata[i].buyerDefaultAddressGuid)[0].transportEmissionUnit;
                                                alldata[i].totalEmission = parseFloat(alldata[i].carbonemissionqty) + parseFloat(response.data.results.filter(a => a.originGuid == alldata[i].supplierDefaultAddressGuid && a.destinationGuid == alldata[i].buyerDefaultAddressGuid)[0].transportEmission);
                                            }
                                            else {
                                                alldata[i].transportEmission = 0;
                                                alldata[i].transportEmissionUnit = "";
                                                alldata[i].totalEmission = parseFloat(alldata[i].carbonemissionqty);
                                            }
                                        }
                                    }
                                    else {
                                        for (let i = 0; i < alldata.length; i++) {
                                            alldata[i].transportEmission = 0;
                                            alldata[i].transportEmissionUnit = "";
                                            alldata[i].totalEmission = parseFloat(alldata[i].carbonemissionqty);
                                        }
                                    }
                                    this.setState({ productTransportEmission: response.data.results });
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
                }
                else {
                    for (let i = 0; i < alldata.length; i++) {
                        alldata[i].transportEmission = 0;
                        alldata[i].transportEmissionUnit = "";
                        alldata[i].totalEmission = parseFloat(alldata[i].carbonemissionqty);
                    }
                }
                for (let i = 0; i < alldata.length; i++) {
                    if (alldata[i].productGuid == this.props.ProductGuid) {
                        alldata[i].GHGSaving = 0;
                        alldata[i].GHGSavingPercent = 0;
                        alldata[i].CarbonAdjustedPrice = 0;
                    }
                    else {
                        let defaultproductdata = alldata.filter(x => x.productGuid === this.props.ProductGuid)[0];
                        let totalGHG = parseFloat(defaultproductdata.carbonemissionqty) - parseFloat(alldata[i].carbonemissionqty);
                        let costoffsetGHG = (parseFloat(totalGHG) * parseFloat(PriceOffOffset) * parseFloat(usdtoinr)) / parseFloat(oneTonne);
                        let emissionqty = this.state.productqty;
                        if (emissionqty == 0) {
                            emissionqty = alldata[i].mOQ
                        }
                        let costoffsetGHGperUnit = parseFloat(costoffsetGHG) / parseFloat(emissionqty);
                        let totalGHGpercent = (parseFloat(totalGHG) / parseFloat(defaultproductdata.carbonemissionqty)) * 100;
                        if (isNaN(totalGHGpercent)) {
                            totalGHGpercent = 0;
                        }
                        if (isNaN(costoffsetGHGperUnit)) {
                            costoffsetGHGperUnit = 0;
                        }
                        alldata[i].GHGSaving = totalGHG;
                        alldata[i].GHGSavingPercent = totalGHGpercent;
                        alldata[i].CarbonAdjustedPrice = parseFloat(alldata[i].priceqty) - parseFloat(costoffsetGHGperUnit);
                    }
                }
                productArray = alldata.filter(x => x.productGuid !== this.props.ProductGuid)
                productArrayShow = alldata.filter(x => x.productGuid !== this.props.ProductGuid)
                if (OrderBy === 'MinPrice') {
                    preference = 'showMinPrice';
                    productArraySort = productArray.sort((a, b) => (a.priceqty - b.priceqty));
                    productArraySortShow = productArray.sort((a, b) => (a.priceqty - b.priceqty));
                }
                else if (OrderBy === 'LeadTime') {
                    preference = 'showLeadTime';
                    productArraySort = productArray.sort((a, b) => (a.leadtimeqty - b.leadtimeqty));
                    productArraySortShow = productArray.sort((a, b) => (a.leadtimeqty - b.leadtimeqty));
                }
                else if (OrderBy === 'Review') {
                    preference = 'showReview';
                    productArraySort = productArray.sort((a, b) => (a.ratings - b.ratings));
                    productArraySortShow = productArrayShow.sort((a, b) => (a.ratings - b.ratings));
                }
                else if (OrderBy === 'MOQ') {
                    preference = 'showMOQ';
                    // productArraySort = productArray.sort((a, b) => (a.moq - b.moq));
                    // productArraySortShow = productArrayShow.sort((a, b) => (a.moq - b.moq));
                    productArraySort = productArray.sort((a, b) => (a.mOQ - b.mOQ));
                    productArraySortShow = productArrayShow.sort((a, b) => (a.mOQ - b.mOQ));
                }
                else if (OrderBy === 'CFprint') {
                    preference = 'showCFprint';
                    productArraySort = productArray.sort((a, b) => (a.carbonemissionqty - b.carbonemissionqty));
                    productArraySortShow = productArray.sort((a, b) => (a.carbonemissionqty - b.carbonemissionqty));
                }
                else if (OrderBy === 'CCperkg') {
                    preference = 'showCCperkg';
                    // productArraySort = productArray.sort((a, b) => (a.moq - b.moq));
                    // productArraySortShow = productArrayShow.sort((a, b) => (a.moq - b.moq));
                    productArraySort = productArray.sort((a, b) => (a.carbonCost - b.carbonCost));
                    productArraySortShow = productArrayShow.sort((a, b) => (a.carbonCost - b.carbonCost));
                }
                else if (OrderBy === 'CAcperkg') {
                    preference = 'showCAcperkg';
                    // productArraySort = productArray.sort((a, b) => (a.moq - b.moq));
                    // productArraySortShow = productArrayShow.sort((a, b) => (a.moq - b.moq));
                    productArraySort = productArray.sort((a, b) => (a.carbonAdjustedCost - b.carbonAdjustedCost));
                    productArraySortShow = productArrayShow.sort((a, b) => (a.carbonAdjustedCost - b.carbonAdjustedCost));
                }
                else if (OrderBy === 'pWeight') {
                    preference = 'showpWeight';
                    productArraySort = productArray.sort((a, b) => (a.plasticWeight - b.plasticWeight));
                    productArraySortShow = productArrayShow.sort((a, b) => (a.plasticWeight - b.plasticWeight));
                }
                else if (OrderBy === 'TEprint') {
                    preference = 'showTEprint';
                    productArraySort = productArray.sort((a, b) => (a.transportEmission - b.transportEmission));
                    productArraySortShow = productArrayShow.sort((a, b) => (a.transportEmission - b.transportEmission));
                }
                else if (OrderBy === 'Environment') {
                    preference = 'showEnvironment';
                    productArraySort = productArray.sort((a, b) => (b.eScore - a.eScore));
                    productArraySortShow = productArrayShow.sort((a, b) => (b.eScore - a.eScore));
                }
                else if (OrderBy === 'Social') {
                    preference = 'showSocial';
                    productArraySort = productArray.sort((a, b) => (b.sScore - a.sScore));
                    productArraySortShow = productArrayShow.sort((a, b) => (b.sScore - a.sScore));
                }
                else if (OrderBy === 'Governance') {
                    preference = 'showGovernance';
                    productArraySort = productArray.sort((a, b) => (b.gScore - a.gScore));
                    productArraySortShow = productArrayShow.sort((a, b) => (b.gScore - a.gScore));
                }
                await this.setState({ DefaultProductListShow: alldata })
                let equaltozero = productArraySort.filter(x => x.carbonemissionqty == 0);
                let greaterzero = productArraySort.filter(x => x.carbonemissionqty > 0);
                equaltozero.map(item => {
                    greaterzero.push(item)
                });
                productArray = greaterzero;
                productArraySortShow = greaterzero;
                productArraySort = greaterzero;

                productArraySort.map(x => {
                    let data = { Id: x.productGuid, Value: x.productName }
                    dropdownData.push(data);
                })
                let currentproductArray = alldata.filter(x => x.productGuid === this.props.ProductGuid)
                ProductShow = ProductShow.concat(currentproductArray);

                ProductShow.map(items => {
                    dropdownData = dropdownData.filter(x => x.Id !== items.productGuid)
                })
                if (productArray.length > 1) {
                    for (let i = 0; i < 2; i++) {
                        dropdownData = dropdownData.filter(x => x.Id !== dropdownData[0].Id)
                        ProductShow.push(productArraySortShow[i]);
                    }
                    const updatedproductDropdown = { ...this.state.productDropdown };
                    dropdownData = dropdownData.filter(x => x.Id !== this.props.ProductGuid)
                    updatedproductDropdown.productList.elementConfig.options = dropdownData;
                    if (this.props.ComparableProductList.length - ProductShow.length > 0) {
                        this.setState({ isblank: false, productDropdown: updatedproductDropdown, ProductListSelectionCount: this.props.ComparableProductList.length - dropdownData.length - ProductShow.length + 1, ProductListShow: ProductShow, showPreference: preference });
                    }
                    else {
                        this.setState({ isblank: false, productDropdown: updatedproductDropdown, ProductListSelectionCount: 0, ProductListShow: ProductShow, showPreference: preference });
                    }
                }
                else {
                    for (let i = 0; i < 1; i++) {
                        ProductShow.push(productArraySortShow[i]);
                    }
                    ProductShow.map(items => {
                        dropdownData = dropdownData.filter(x => x.Id !== items.productGuid)
                    })
                    const updatedproductDropdown = { ...this.state.productDropdown };
                    dropdownData = dropdownData.filter(x => x.Id !== this.props.ProductGuid)
                    updatedproductDropdown.productList.elementConfig.options = dropdownData;
                    if (this.props.ComparableProductList.length - ProductShow.length > 0) {

                        this.setState({ isblank: false, productDropdown: updatedproductDropdown, ProductListSelectionCount: this.props.ComparableProductList.length - dropdownData.length - ProductShow.length + 1, ProductListShow: ProductShow, showPreference: preference });
                    }
                    else {
                        this.setState({ isblank: false, productDropdown: updatedproductDropdown, ProductListSelectionCount: 0, ProductListShow: ProductShow, showPreference: preference });
                    }
                }
            }
        }
    }
    addItemsProductListShow = (event, productGuid) => {
        let productArray = [];
        let productData = [];
        productArray = this.state.ProductList.filter(x => x.productGuid === productGuid)

        const updatedproductDropdown = { ...this.state.productDropdown };
        let checkProduct = this.state.productDropdown.productList.elementConfig.options.filter(x => x.Id === productGuid)
        if (checkProduct.length === 0) {
            productData = { Id: productArray[0].productGuid, Value: productArray[0].productName }
            updatedproductDropdown.productList.elementConfig.options.push(productData);
            this.setState({ productDropdown: updatedproductDropdown });
        }
        if (this.state.ProductListShow.length <= 3) {
            this.setState({ ProductListSelectionCount: (this.state.ProductListSelectionCount + 1), showProductCount: 0 });
        }
        else {
            this.setState({ ProductListSelectionCount: (this.state.ProductListSelectionCount + 1), showProductCount: 0 });
        }
        var array = [...this.state.ProductListShow];
        let PArray = this.state.ProductListShow.filter(x => x.productGuid === productGuid)
        for (var i in array) {
            if (array[i].productGuid === PArray[0].productGuid) {
                array.splice(i, 1);
                this.setState({ ProductListShow: array, showdropdown: true });
                break;
            }
        }
    }

    componentWillReceiveProps(nextprops) {
        let quantity = 0;
        if (nextprops.SavingsQuantity > 0) {
            this.getSavingDetails(nextprops.SavingsQuantity);
            quantity = nextprops.SavingsQuantity;
        }
    }

    getstateproductguid() {
        let productlistshowsortedarray = [];
        if (this.state.ProductListShow.length > 0) {
            if (this.state.ProductListShow[0].listProductVariantsVM.length > 0) {
                if (this.state.ProductListShow[0].listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSKUGuid).length > 0) {
                    productlistshowsortedarray = this.state.ProductListShow.sort((a, b) => (a.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSKUGuid)[0].carbonEmission - b.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSKUGuid)[0].carbonEmission));
                    // productlistshowsortedarray = this.state.ProductListShow.sort(a => a.carbonEmission - this.props.carbonEmission);
                    if (this.state.ProductListShow.listProductVariantsVM.filter(a => a.carbonEmission === this.props.carbonEmission)
                        >
                        productlistshowsortedarray[0].listProductVariantsVM.filter(a => a.carbonEmission === this.props.carbonEmission)
                    ) {
                        stateproductguid = [];
                        stateproductguid.push(this.props.ProductGuid);
                    }
                    else if (this.state.ProductListShow.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSKUGuid)[0].carbonEmission
                        <
                        productlistshowsortedarray[0].listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSKUGuid)[0].carbonEmission
                    ) {
                        stateproductguid = [];
                        productlistshowsortedarray.filter(item => item.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSKUGuid)[0].carbonEmission
                            == productlistshowsortedarray[0].listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSKUGuid)[0].carbonEmission).map(filteritem => {
                                stateproductguid.push(filteritem.productGuid);
                            });

                    }
                    else if (this.state.ProductListShow.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSKUGuid)[0].carbonEmission
                        ===
                        productlistshowsortedarray[0].listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSKUGuid)[0].carbonEmission
                    ) {
                        stateproductguid = [];
                        productlistshowsortedarray.filter(item => item.listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSKUGuid)[0].carbonEmission
                            == productlistshowsortedarray[0].listProductVariantsVM.filter(a => a.skuGuid === this.props.SelectedSKUGuid)[0].carbonEmission).map(filteritem => {
                                stateproductguid.push(filteritem.productGuid);
                            });
                        stateproductguid.push(this.props.ProductGuid);
                    }
                }
            }
        }
    }
    enterkeyproceed = (event) => {
        if (event.key === "Enter") {
            this.enteredquantitycalculation();

        }
    };
    changequantity(event, unit) {
        let isValid = true
        let newThemeError = "";
        let value = 0;
        if (event.target.value.length > 15) {
            event.target.value = event.target.value.slice(0, 15);
            newThemeError = "Maximun Length allowed is 15 digits";
            isValid = false;
        }
        if (unit == "Pieces") {
            let rePhone = /^[0-9]*$/  //Int
            if (!rePhone.test(event.target.value)) {
                isValid = false;
                newThemeError = "Invalid Value. Decimal value are not allowed in " + unit.toLowerCase();
            }
            else {
                if (event.target.value == "") {
                    event.target.value = 0;
                }
                value = parseInt(event.target.value);
            }
        }
        else {
            let rePhone = /^[0-9]*(\.[0-9]{0,2})?$/  //Decimal-Int
            if (!rePhone.test(event.target.value)) {
                isValid = false;
                let reAlphaNumeric = /^[a-z0-9]+$/i;
                let alphabetcheck = /^[a-zA-Z\s]+$/;
                let specialcharcheck = /^[.\w\s]*$/;
                let dotvalues = String(event.target.value).split('.');
                if (alphabetcheck.test(event.target.value)) {
                    newThemeError = "Invalid Value. Alphabets are not allowed.";
                } else if (reAlphaNumeric.test(event.target.value)) {
                    newThemeError = "Invalid Value. Alphanumerics are not allowed";
                } else if (!specialcharcheck.test(event.target.value)) {
                    newThemeError = "Invalid Value. Special characters are not allowed.";
                } else if (dotvalues.length > 2) {
                    newThemeError = "Invalid Value.Two decimals are not allowed";
                } else {
                    newThemeError = "only two numbers after decimal are allowed";
                }
            }
            else {
                if (event.target.value == "") {
                    event.target.value = 0.00;
                }
                value = parseFloat(event.target.value);
            }
        }
        if (isValid) {
            this.setState({ productqty: value, newThemeError: "" });
        }
        else {
            this.setState({ newThemeError: newThemeError });
        }
    }
    async getsubtractionvalue(qty, decimalvalue) {
        returnvaluearray = [];
        let q = (parseFloat(qty).toFixed(decimalvalue)).toString();
        let returnvalue = 1
        let qtysplit = q.split('.')[1];
        if (qtysplit != '00') {
            returnvalue = '0.' + qtysplit
        }
        returnvaluearray.push({ "returnvalue": returnvalue });
        return returnvaluearray[0];
    }
    getpriceacctoquantity(ratecard, quantity) {
        let pricing = 0;
        let leadtime = 0;
        let mxoq = 0;
        let greaterthanmoq = true;
        let filterlenght = true;
        if (ratecard[0].quantity1 > 0 && ratecard[0].quantity2 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity2, this.props.DecimalPrecision);
            if (ratecard[0].quantity1 <= quantity && quantity <= (ratecard[0].quantity2 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price1;
                leadtime = ratecard[0].leadTime1InDays;
                mxoq = ratecard[0].quantity1;
                greaterthanmoq = false;
            }
        }
        else if (ratecard[0].quantity1 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (quantity >= ratecard[0].quantity1 && quantity <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price1;
                    leadtime = ratecard[0].leadTime1InDays;
                    mxoq = ratecard[0].quantity1;
                    greaterthanmoq = false;
                }
            }
            else {
                if (quantity <= ratecard[0].quantity1 && pricing === 0) {
                    pricing = ratecard[0].price1;
                    leadtime = ratecard[0].leadTime1InDays;
                    mxoq = ratecard[0].quantity1;
                    //  greaterthanmoq = false;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price1;
                    leadtime = ratecard[0].leadTime1InDays;
                    mxoq = ratecard[0].quantity1;
                }
            }
        }
        if (ratecard[0].quantity2 > 0 && ratecard[0].quantity3 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity3, this.props.DecimalPrecision)
            if (ratecard[0].quantity2 <= quantity && quantity <= (ratecard[0].quantity3 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price2;
                leadtime = ratecard[0].leadTime2InDays;
                mxoq = ratecard[0].quantity2;
                greaterthanmoq = false;
            }
        }
        else if (ratecard[0].quantity2 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (quantity >= ratecard[0].quantity2 && quantity <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price2;
                    leadtime = ratecard[0].leadTime2InDays;
                    mxoq = ratecard[0].quantity2;
                    greaterthanmoq = false;
                }
            }
            else {
                if (quantity <= ratecard[0].quantity2 && pricing === 0) {
                    pricing = ratecard[0].price2;
                    leadtime = ratecard[0].leadTime2InDays;
                    mxoq = ratecard[0].quantity2;
                    //greaterthanmoq = false;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price2;
                    leadtime = ratecard[0].leadTime2InDays;
                    mxoq = ratecard[0].quantity2;
                }
            }
        }
        if (ratecard[0].quantity3 > 0 && ratecard[0].quantity4 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity4, this.props.DecimalPrecision)
            if (ratecard[0].quantity3 <= quantity && quantity <= (ratecard[0].quantity4 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price3;
                leadtime = ratecard[0].leadTime3InDays;
                mxoq = ratecard[0].quantity3;
                greaterthanmoq = false;
            }
        }
        else if (ratecard[0].quantity3 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (quantity >= ratecard[0].quantity3 && quantity <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price3;
                    leadtime = ratecard[0].leadTime3InDays;
                    mxoq = ratecard[0].quantity3;
                    greaterthanmoq = false;
                }
            }
            else {
                if (quantity <= ratecard[0].quantity3 && pricing === 0) {
                    pricing = ratecard[0].price3;
                    leadtime = ratecard[0].leadTime3InDays;
                    mxoq = ratecard[0].quantity3;
                    // greaterthanmoq = false;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price3;
                    leadtime = ratecard[0].leadTime3InDays;
                    mxoq = ratecard[0].quantity3;
                }
            }
        }
        if (ratecard[0].quantity4 > 0 && ratecard[0].quantity5 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity5, this.props.DecimalPrecision)
            if (ratecard[0].quantity4 <= quantity && quantity <= (ratecard[0].quantity5 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price4;
                leadtime = ratecard[0].leadTime4InDays;
                mxoq = ratecard[0].quantity4;
                greaterthanmoq = false;
            }
        }
        else if (ratecard[0].quantity4 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (quantity >= ratecard[0].quantity4 && quantity <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price4;
                    leadtime = ratecard[0].leadTime4InDays;
                    mxoq = ratecard[0].quantity4;
                    greaterthanmoq = false;
                }
            }
            else {
                if (quantity <= ratecard[0].quantity4 && pricing === 0) {
                    pricing = ratecard[0].price4;
                    leadtime = ratecard[0].leadTime4InDays;
                    mxoq = ratecard[0].quantity4;
                    //greaterthanmoq = false;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price4;
                    leadtime = ratecard[0].leadTime4InDays;
                    mxoq = ratecard[0].quantity4;
                }
            }
        }
        if (ratecard[0].quantity5 > 0 && ratecard[0].quantity6 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity6, this.props.DecimalPrecision)
            if (ratecard[0].quantity5 <= quantity && quantity <= (ratecard[0].quantity6 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price5;
                leadtime = ratecard[0].leadTime5InDays;
                mxoq = ratecard[0].quantity5;
                greaterthanmoq = false;
            }
        }
        else if (ratecard[0].quantity5 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (quantity >= ratecard[0].quantity5 && quantity <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price5;
                    leadtime = ratecard[0].leadTime5InDays;
                    mxoq = ratecard[0].quantity5;
                    greaterthanmoq = false;
                }
            }
            else {
                if (quantity <= ratecard[0].quantity5 && pricing === 0) {
                    pricing = ratecard[0].price5;
                    leadtime = ratecard[0].leadTime5InDays;
                    mxoq = ratecard[0].quantity5;
                    //greaterthanmoq = false;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price5;
                    leadtime = ratecard[0].leadTime5InDays;
                    mxoq = ratecard[0].quantity5;
                }
            }
        }
        if (ratecard[0].quantity6 > 0 && ratecard[0].quantity7 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity7, this.props.DecimalPrecision)
            if (ratecard[0].quantity6 <= quantity && quantity <= (ratecard[0].quantity7 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price6;
                leadtime = ratecard[0].leadTime6InDays;
                mxoq = ratecard[0].quantity6;
                greaterthanmoq = false;
            }
        }
        else if (ratecard[0].quantity6 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (quantity >= ratecard[0].quantity6 && quantity <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price6;
                    leadtime = ratecard[0].leadTime6InDays;
                    mxoq = ratecard[0].quantity6;
                    greaterthanmoq = false;
                }
            }
            else {
                if (quantity <= ratecard[0].quantity6 && pricing === 0) {
                    pricing = ratecard[0].price6;
                    leadtime = ratecard[0].leadTime6InDays;
                    mxoq = ratecard[0].quantity6;
                    //greaterthanmoq = false;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price6;
                    leadtime = ratecard[0].leadTime6InDays;
                    mxoq = ratecard[0].quantity6;
                }
            }
        }
        if (ratecard[0].quantity7 > 0 && ratecard[0].quantity8 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity8, this.props.DecimalPrecision)
            if (ratecard[0].quantity7 <= quantity && quantity <= (ratecard[0].quantity8 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price7;
                leadtime = ratecard[0].leadTime7InDays;
                mxoq = ratecard[0].quantity7;
                greaterthanmoq = false;
            }
        }
        else if (ratecard[0].quantity7 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (quantity >= ratecard[0].quantity7 && quantity <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price7;
                    leadtime = ratecard[0].leadTime7InDays;
                    mxoq = ratecard[0].quantity7;
                    greaterthanmoq = false;
                }
            }
            else {
                if (quantity <= ratecard[0].quantity7 && pricing === 0) {
                    pricing = ratecard[0].price7;
                    leadtime = ratecard[0].leadTime7InDays;
                    mxoq = ratecard[0].quantity7;
                    //greaterthanmoq = false;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price7;
                    leadtime = ratecard[0].leadTime7InDays;
                    mxoq = ratecard[0].quantity7;
                }
            }
        }
        if (ratecard[0].quantity8 > 0 && ratecard[0].quantity9 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity9, this.props.DecimalPrecision)
            if (ratecard[0].quantity8 <= quantity && quantity <= (ratecard[0].quantity9 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price8;
                leadtime = ratecard[0].leadTime8InDays;
                mxoq = ratecard[0].quantity8;
                greaterthanmoq = false;
            }
        }
        else if (ratecard[0].quantity8 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (quantity >= ratecard[0].quantity8 && quantity <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price8;
                    leadtime = ratecard[0].leadTime8InDays;
                    mxoq = ratecard[0].quantity8;
                    greaterthanmoq = false;
                }
            }
            else {
                if (quantity <= ratecard[0].quantity8 && pricing === 0) {
                    pricing = ratecard[0].price8;
                    leadtime = ratecard[0].leadTime8InDays;
                    mxoq = ratecard[0].quantity8;
                    //greaterthanmoq = false;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price8;
                    leadtime = ratecard[0].leadTime8InDays;
                    mxoq = ratecard[0].quantity8;
                }
            }
        }
        if (ratecard[0].quantity9 > 0 && ratecard[0].quantity10 > 0) {
            this.getsubtractionvalue(ratecard[0].quantity10, this.props.DecimalPrecision)
            if (ratecard[0].quantity9 <= quantity && quantity <= (ratecard[0].quantity10 - returnvaluearray[0].returnvalue)) {
                pricing = ratecard[0].price9;
                leadtime = ratecard[0].leadTime9InDays;
                mxoq = ratecard[0].quantity9;
                greaterthanmoq = false;
            }
        }
        else if (ratecard[0].quantity9 > 0) {
            if (ratecard[0].maximumOrderQuantity > 0) {
                if (quantity >= ratecard[0].quantity9 && quantity <= ratecard[0].maximumOrderQuantity) {
                    pricing = ratecard[0].price9;
                    leadtime = ratecard[0].leadTime9InDays;
                    mxoq = ratecard[0].quantity9;
                    greaterthanmoq = false;
                }
            }
            else {
                if (quantity <= ratecard[0].quantity9 && pricing === 0) {
                    pricing = ratecard[0].price9;
                    leadtime = ratecard[0].leadTime9InDays;
                    mxoq = ratecard[0].quantity9;
                    //greaterthanmoq = false;
                }
                else if (pricing === 0) {
                    pricing = ratecard[0].price9;
                    leadtime = ratecard[0].leadTime9InDays;
                    mxoq = ratecard[0].quantity9;
                }
            }
        }
        if (quantity >= this.props.ComparableProductList.filter(x => x.productGuid === ratecard[0].productGuid)[0].mOQ) {
            filterlenght = false;
        }
        else {
            filterlenght = true;
        }
        if (ratecard[0].maximumOrderQuantity === 0) {
            greaterthanmoq = false;
        }

        pricelead.push({ "leadtime": leadtime, "pricing": pricing, "mxoq": mxoq, "greaterthanmoq": greaterthanmoq, "filterlenght": filterlenght });
        return pricelead[0];
    }
    async enteredquantitycalculation() {
        qtyperunitvalue = this.state.productqty;
        let alldata = this.props.ComparableProductList; //this.state.ProductListShow;
        if (alldata.filter(x => x.mOQ <= this.state.productqty).length > 0) {
            isfilterlength = true;
            //alldata = alldata.filter(x => x.mOQ <= this.state.productqty);
        } else {
            isfilterlength = false;
        }
        let AllAddressList = [];
        let moqdata = alldata;
        {
            let defaultsku = '00000000-0000-0000-0000-000000000000';
            let ratecard = [];
            this.calculatetotalemission();
            let emissionqty = this.state.productqty;
            for (let i = 0; i < alldata.length; i++) {
                defaultsku = alldata[i].listRateCardVM.filter(y => y.isDefault == true).length > 0 ? alldata[i].listRateCardVM.filter(y => y.isDefault == true)[0].skuGuid : '00000000-0000-0000-0000-000000000000';
                ratecard = alldata[i].listRateCardVM.filter(y => y.isDefault == true);
                if (ratecard.length > 0) {
                    if (ratecard[0].maximumOrderQuantity < this.state.productqty) {
                        isgreaterthanmaxorderqty = true;
                    }
                    else {
                        isgreaterthanmaxorderqty = false;
                    }
                    if (this.state.productqty > 0) {
                        this.getpriceacctoquantity(ratecard, this.state.productqty)
                    }
                    else {
                        emissionqty = alldata.filter(x => x.productGuid === alldata[i].productGuid)[0].mOQ
                        this.getpriceacctoquantity(ratecard, emissionqty)
                    }
                    moqdata[i].priceqty = pricelead[0].pricing;
                    moqdata[i].leadtimeqty = pricelead[0].leadtime;
                    moqdata[i].greaterthanmoq = pricelead[0].greaterthanmoq;
                    moqdata[i].filterlenght = pricelead[0].filterlenght;
                    moqdata[i].plasticWeight = moqdata[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku).length > 0 ?
                        (alldata[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].plasticWeight != null || alldata[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].plasticWeight != undefined || alldata[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].plasticWeight != "") ?
                            parseFloat(alldata[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].plasticWeight) * parseFloat(emissionqty) : 0 : 0;
                    moqdata[i].plasticWeightUnit = alldata[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].weightUnit
                    pricelead = [];
                    AllAddressList.push({
                        "OriginGuid": alldata[i].supplierDefaultAddressGuid,
                        "DestinationGuid": alldata[i].buyerDefaultAddressGuid,
                        "Weight": this.props.unitList.filter(x => x.unitGuid === alldata[i].quantityUnitGuid)[0].unitType == "unit" ? parseFloat(alldata[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].weight) * parseFloat(emissionqty) : parseFloat(emissionqty),
                        "WeightUnit": this.props.unitList.filter(x => x.unitGuid === alldata[i].quantityUnitGuid)[0].unitType == "unit" ? alldata[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].weightUnit : this.props.unitList.filter(x => x.unitGuid === alldata[i].quantityUnitGuid)[0].name
                    })
                }
                let formbody = {};
                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.tokenId,
                        'Content-Type': 'application/json',
                        'ProductGuid': alldata[i].productGuid,
                        'SkuGuid': defaultsku,
                        'Quantity': emissionqty
                    },
                };
                await axios
                    .post(getServiceUrl() + "Product/GetProductCarbonEmissionDetails?", formbody, config)
                    .then((response) => {
                        if (response != null) {
                            if (response.data.table1.length > 0) {
                                moqdata[i].carbonemissionqty = response.data.table1[0].carbonEmission;
                                moqdata[i].carbonemissionunit = response.data.table1[0].carbonEmissionUnit;
                            }
                        }
                        else {
                            moqdata[i].carbonemissionqty = 0;
                            moqdata[i].carbonemissionunit = "";
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
        }
        AllAddressList = AllAddressList.filter(a => a.OriginGuid != null && a.OriginGuid != undefined);
        AllAddressList = AllAddressList.filter(a => a.DestinationGuid != null && a.DestinationGuid != undefined);
        if (AllAddressList.length > 0) {
            {
                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.tokenId,
                        'Content-Type': 'application/json'
                    },
                };
                await axios
                    .post(getServiceUrl() + "Rfq/GetTrasnportEmission?", AllAddressList, config)
                    .then((response) => {
                        if (response != null) {
                            if (response.data.status == 200) {
                                for (let i = 0; i < moqdata.length; i++) {
                                    if (response.data.results.filter(a => a.originGuid == moqdata[i].supplierDefaultAddressGuid && a.destinationGuid == moqdata[i].buyerDefaultAddressGuid).length > 0) {

                                        moqdata[i].transportEmission = response.data.results.filter(a => a.originGuid == moqdata[i].supplierDefaultAddressGuid && a.destinationGuid == moqdata[i].buyerDefaultAddressGuid)[0].transportEmission;
                                        moqdata[i].transportEmissionUnit = response.data.results.filter(a => a.originGuid == moqdata[i].supplierDefaultAddressGuid && a.destinationGuid == moqdata[i].buyerDefaultAddressGuid)[0].transportEmissionUnit;
                                        moqdata[i].totalEmission = parseFloat(moqdata[i].carbonemissionqty) + parseFloat(response.data.results.filter(a => a.originGuid == moqdata[i].supplierDefaultAddressGuid && a.destinationGuid == moqdata[i].buyerDefaultAddressGuid)[0].transportEmission);
                                    }
                                    else {
                                        moqdata[i].transportEmission = 0;
                                        moqdata[i].transportEmissionUnit = "";
                                        moqdata[i].totalEmission = parseFloat(moqdata[i].carbonemissionqty);
                                    }
                                }
                            }
                            else {
                                for (let i = 0; i < moqdata.length; i++) {
                                    moqdata[i].transportEmission = 0;
                                    moqdata[i].transportEmissionUnit = "";
                                    moqdata[i].totalEmission = parseFloat(moqdata[i].carbonemissionqty);
                                }
                            }
                            this.setState({ productTransportEmission: response.data.results });
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
        }
        else {
            for (let i = 0; i < alldata.length; i++) {
                moqdata[i].transportEmission = 0;
                moqdata[i].transportEmissionUnit = "";
                moqdata[i].totalEmission = parseFloat(moqdata[i].carbonemissionqty);
            }
        }

        for (let i = 0; i < moqdata.length; i++) {
            if (moqdata[i].productGuid == this.props.ProductGuid) {
                moqdata[i].GHGSaving = 0;
                moqdata[i].GHGSavingPercent = 0;
                moqdata[i].CarbonAdjustedPrice = 0;
            }
            else {
                let defaultproductdata = moqdata.filter(x => x.productGuid === this.props.ProductGuid)[0];
                let totalGHG = parseFloat(defaultproductdata.carbonemissionqty) - parseFloat(moqdata[i].carbonemissionqty);
                let costoffsetGHG = (parseFloat(totalGHG) * parseFloat(PriceOffOffset) * parseFloat(usdtoinr)) / parseFloat(oneTonne);
                let emissionqty = this.state.productqty;
                if (emissionqty == 0) {
                    emissionqty = moqdata[i].mOQ
                }
                let costoffsetGHGperUnit = parseFloat(costoffsetGHG) / parseFloat(emissionqty);
                let totalGHGpercent = (parseFloat(totalGHG) / parseFloat(defaultproductdata.carbonemissionqty)) * 100
                if (isNaN(totalGHGpercent)) {
                    totalGHGpercent = 0;
                }
                if (isNaN(costoffsetGHGperUnit)) {
                    costoffsetGHGperUnit = 0;
                }
                moqdata[i].GHGSaving = totalGHG;
                moqdata[i].GHGSavingPercent = totalGHGpercent;
                moqdata[i].CarbonAdjustedPrice = parseFloat(moqdata[i].priceqty) - parseFloat(costoffsetGHGperUnit);
            }
        }
        let ProductShow = this.state.ProductListShow;
        const myArrayFiltered = moqdata.filter((el) => {
            return ProductShow.some((f) => {
                return f.productGuid === el.productGuid;
            });
        });

        this.setState({
            ProductListShow: myArrayFiltered,
            isblank: false,
            ProductListSelectionCount: this.state.ProductListSelectionCount
        }, () => { });
        this.getDataBySelection('', this.state.orderby)
        isfilterlength = true;
        isgreaterthanmaxorderqty = false;
    }
    async calculatetotalemission() {
        if (this.props.ratecardlist.length > 0) {
            this.getpriceacctoquantity(this.props.ratecardlist, this.state.productqty)
            this.setState({ priceqty: pricelead[0].pricing, leadtimeqty: pricelead[0].leadtime })
            pricelead = [];
        }
        let formbody = {};
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'ProductGuid': this.props.ProductGuid,
                'SkuGuid': this.props.SelectedSKUGuid,
                'Quantity': this.state.productqty
            },
        };
        await axios
            .post(getServiceUrl() + "Product/GetProductCarbonEmissionDetails?", formbody, config)
            .then((response) => {
                if (response != null) {
                    if (response.data.table1.length > 0) {
                        this.setState({
                            CarbonEmission: response.data.table1[0].carbonEmission,
                            CarbonEmissionUnit: response.data.table1[0].carbonEmissionUnit
                        });
                    }
                }
                else {
                    this.setState({
                        CarbonEmission: 0,
                    });
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
    async handleClickComparePopover(event, productGuid) {
        await this.setState({
            anchorEl: event.currentTarget,
            currentProductGuid: productGuid
        });
    };

    handleCloseComparePopover = () => {
        this.setState({
            anchorEl: null,
        });
    };
    checkFileExist = async (productCertificateName, supplierGuid, productCode) => {
        try {
            const response = await axios({
                method: 'get',
                url: awsUrl + "ProductCertificates/" + supplierGuid + "/" + productCode + "/" + productCertificateName,
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf'
                }
            });
            const blob = new Blob([response.data], {
                type: 'application/pdf',
            });
            urlRes.push({ "status": true, "certificate": productCertificateName, "supplierGuid": supplierGuid, "productCode": productCode });
        } catch (err) {
            urlRes.push({ "status": false, "certificate": productCertificateName, "supplierGuid": supplierGuid, "productCode": productCode });
        }
        return urlRes[0];
    }
    onDownloadClick = async (evt, productCertificateName, SupplierGuid, ProductCode) => {
        const anchor = evt.target.parentNode;
        try {
            const response = await axios({
                method: 'get',
                url: awsUrl + "ProductCertificates/" + SupplierGuid + "/" + ProductCode + "/" + productCertificateName,
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf'
                }
            });
            const blob = new Blob([response.data], {
                type: 'application/pdf',
            });
            anchor.href = window.URL.createObjectURL(blob);
            anchor.download = productCertificateName;
            anchor.click();
        } catch (err) {
            anchor.className = "disabled"
        }
    }
    async replaceproduct(insertproductguid) {
        var showedallproductsinstae = this.state.ProductListShow.filter(a => a.productGuid != this.state.currentProductGuid);
        var showedallproductsinprops = this.props.ComparableProductList.filter(a => a.productGuid == insertproductguid);
        let AllAddressList = [];
        let moqdata = showedallproductsinprops;
        if (showedallproductsinprops != null && showedallproductsinprops != "" && showedallproductsinprops.length > 0) {
            let defaultsku = '00000000-0000-0000-0000-000000000000';
            let ratecard = [];
            let emissionqty = this.state.productqty;
            for (let i = 0; i < showedallproductsinprops.length; i++) {
                defaultsku = showedallproductsinprops[i].listRateCardVM.filter(y => y.isDefault == true).length > 0 ? showedallproductsinprops[i].listRateCardVM.filter(y => y.isDefault == true)[0].skuGuid : '00000000-0000-0000-0000-000000000000';
                ratecard = showedallproductsinprops[i].listRateCardVM.filter(y => y.isDefault == true);
                if (ratecard.length > 0) {
                    if (ratecard[0].maximumOrderQuantity < this.state.productqty) {
                        isgreaterthanmaxorderqty = true;
                    }
                    else {
                        isgreaterthanmaxorderqty = false;
                    }
                    if (this.state.productqty > 0) {
                        this.getpriceacctoquantity(ratecard, this.state.productqty)
                    }
                    else {
                        emissionqty = showedallproductsinprops.filter(x => x.productGuid === showedallproductsinprops[i].productGuid)[0].mOQ
                        this.getpriceacctoquantity(ratecard, emissionqty)
                    }
                    moqdata[i].priceqty = pricelead[0].pricing;
                    moqdata[i].leadtimeqty = pricelead[0].leadtime;
                    moqdata[i].greaterthanmoq = pricelead[0].greaterthanmoq;
                    moqdata[i].filterlenght = pricelead[0].filterlenght;
                    moqdata[i].plasticWeight = moqdata[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku).length > 0 ?
                        (showedallproductsinprops[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].plasticWeight != null || showedallproductsinprops[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].plasticWeight != undefined || showedallproductsinprops[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].plasticWeight != "") ?
                            parseFloat(showedallproductsinprops[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].plasticWeight) * parseFloat(emissionqty) : 0 : 0;
                    moqdata[i].plasticWeightUnit = showedallproductsinprops[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].weightUnit
                    pricelead = [];
                    AllAddressList.push({
                        "OriginGuid": showedallproductsinprops[i].supplierDefaultAddressGuid,
                        "DestinationGuid": showedallproductsinprops[i].buyerDefaultAddressGuid,
                        "Weight": this.props.unitList.filter(x => x.unitGuid === showedallproductsinprops[i].quantityUnitGuid)[0].unitType == "unit" ? parseFloat(showedallproductsinprops[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].weight) * parseFloat(emissionqty) : parseFloat(emissionqty),
                        "WeightUnit": this.props.unitList.filter(x => x.unitGuid === showedallproductsinprops[i].quantityUnitGuid)[0].unitType == "unit" ? showedallproductsinprops[i].listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].weightUnit : this.props.unitList.filter(x => x.unitGuid === showedallproductsinprops[i].quantityUnitGuid)[0].name
                    })
                }
                let formbody = {};
                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.tokenId,
                        'Content-Type': 'application/json',
                        'ProductGuid': showedallproductsinprops[i].productGuid,
                        'SkuGuid': defaultsku,
                        'Quantity': emissionqty
                    },
                };
                await axios
                    .post(getServiceUrl() + "Product/GetProductCarbonEmissionDetails?", formbody, config)
                    .then((response) => {
                        if (response != null) {
                            if (response.data.table1.length > 0) {
                                moqdata[i].carbonemissionqty = response.data.table1[0].carbonEmission;
                                moqdata[i].carbonemissionunit = response.data.table1[0].carbonEmissionUnit;
                            }
                        }
                        else {
                            moqdata[i].carbonemissionqty = 0;
                            moqdata[i].carbonemissionunit = "";
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
        }

        AllAddressList = AllAddressList.filter(a => a.OriginGuid != null && a.OriginGuid != undefined);
        AllAddressList = AllAddressList.filter(a => a.DestinationGuid != null && a.DestinationGuid != undefined);
        if (AllAddressList.length > 0) {
            {
                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.tokenId,
                        'Content-Type': 'application/json'
                    },
                };
                await axios
                    .post(getServiceUrl() + "Rfq/GetTrasnportEmission?", AllAddressList, config)
                    .then((response) => {
                        if (response != null) {
                            if (response.data.status == 200) {
                                for (let i = 0; i < moqdata.length; i++) {
                                    if (response.data.results.filter(a => a.originGuid == moqdata[i].supplierDefaultAddressGuid && a.destinationGuid == moqdata[i].buyerDefaultAddressGuid).length > 0) {

                                        moqdata[i].transportEmission = response.data.results.filter(a => a.originGuid == moqdata[i].supplierDefaultAddressGuid && a.destinationGuid == moqdata[i].buyerDefaultAddressGuid)[0].transportEmission;
                                        moqdata[i].transportEmissionUnit = response.data.results.filter(a => a.originGuid == moqdata[i].supplierDefaultAddressGuid && a.destinationGuid == moqdata[i].buyerDefaultAddressGuid)[0].transportEmissionUnit;
                                        moqdata[i].totalEmission = parseFloat(moqdata[i].carbonemissionqty) + parseFloat(response.data.results.filter(a => a.originGuid == moqdata[i].supplierDefaultAddressGuid && a.destinationGuid == moqdata[i].buyerDefaultAddressGuid)[0].transportEmission);
                                    }
                                    else {
                                        moqdata[i].transportEmission = 0;
                                        moqdata[i].transportEmissionUnit = "";
                                        moqdata[i].totalEmission = parseFloat(moqdata[i].carbonemissionqty);
                                    }
                                }
                            }
                            else {
                                for (let i = 0; i < moqdata.length; i++) {
                                    moqdata[i].transportEmission = 0;
                                    moqdata[i].transportEmissionUnit = "";
                                    moqdata[i].totalEmission = parseFloat(moqdata[i].carbonemissionqty);
                                }
                            }
                            this.setState({ productTransportEmission: response.data.results });
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
        }
        else {
            for (let i = 0; i < showedallproductsinprops.length; i++) {
                moqdata[i].transportEmission = 0;
                moqdata[i].transportEmissionUnit = "";
                moqdata[i].totalEmission = parseFloat(moqdata[i].carbonemissionqty);
            }
        }
        for (let i = 0; i < moqdata.length; i++) {
            if (moqdata[i].productGuid == this.props.ProductGuid) {
                moqdata[i].GHGSaving = 0;
                moqdata[i].GHGSavingPercent = 0;
                moqdata[i].CarbonAdjustedPrice = 0;
            }
            else {
                let defaultproductdata = showedallproductsinstae.filter(x => x.productGuid === this.props.ProductGuid)[0];
                let totalGHG = parseFloat(defaultproductdata.carbonemissionqty) - parseFloat(moqdata[i].carbonemissionqty);
                let costoffsetGHG = (parseFloat(totalGHG) * parseFloat(PriceOffOffset) * parseFloat(usdtoinr)) / parseFloat(oneTonne);
                let emissionqty = this.state.productqty;
                if (emissionqty == 0) {
                    emissionqty = moqdata[i].mOQ
                }
                let costoffsetGHGperUnit = parseFloat(costoffsetGHG) / parseFloat(emissionqty);
                let totalGHGpercent = (parseFloat(totalGHG) / parseFloat(defaultproductdata.carbonemissionqty)) * 100;
                if (isNaN(totalGHGpercent)) {
                    totalGHGpercent = 0;
                }
                if (isNaN(costoffsetGHGperUnit)) {
                    costoffsetGHGperUnit = 0;
                }
                moqdata[i].GHGSaving = totalGHG;
                moqdata[i].GHGSavingPercent = totalGHGpercent;
                moqdata[i].CarbonAdjustedPrice = parseFloat(moqdata[i].priceqty) - parseFloat(costoffsetGHGperUnit);
            }
        }
        if (moqdata != null && moqdata != "" && moqdata.length > 0) {
            showedallproductsinstae.push(moqdata[0])
        }
        this.handleCloseComparePopover();
        await this.setState({ ProductListShow: showedallproductsinstae })
        this.getDataBySelection('', this.state.orderby, 'replace')
    }
    render() {
        const { anchorEl } = this.state;
        const open = Boolean(anchorEl);
        let imagesrc = '';
        let colspan = this.state.ProductListShow.length + 1;
        const DialogContent = withStyles(theme => ({
            root: {
                margin: 0,
                padding: theme.spacing.unit * 2,
            },
        }))(MuiDialogContent);
        lowestTransportEmission = [];
        lowestCarbonEmission = [];
        lowestPlasticWeight = [];
        lowestLeadTime = [];
        lowestPrice = [];
        lowestMoq = [];
        highestescore = [];
        highestsscore = [];
        highestgscore = [];
        // this.getstateproductguid();   
        const { classes } = this.props;
        let qtyperunit = 0;
        if (this.state.isblank == false) {
            qtyperunit = qtyperunitvalue;
        }
        else {
            if (this.state.ProductListShow.length > 0 && this.state.ProductListShow !== undefined) {
                qtyperunit = this.state.ProductListShow.filter(x => x.productGuid === this.props.ProductGuid)[0].mOQ
            }
        }
        let QuantityUnit = ""
        if (this.props.quantityname !== undefined) {
            if (this.props.quantityname.toLowerCase() == 'metric tonnes' || this.props.quantityname.toLowerCase() == 'pieces') {
                if (qtyperunit > 0) {
                    QuantityUnit = " Per unit for " + qtyperunit + " " + this.props.quantityname.slice(0, -1);
                }
                else {
                    QuantityUnit = " Per " + this.props.quantityname.slice(0, -1);
                }
            }
            else {
                if (qtyperunit > 0) {
                    QuantityUnit = " Per unit for " + qtyperunit + " " + this.props.quantityname;
                }
                else {
                    QuantityUnit = " Per " + this.props.quantityname;
                }
            }
        }

        const productDropdownArray = [];
        for (let key in this.state.productDropdown) {
            productDropdownArray.push({
                id: key,
                config: this.state.productDropdown[key]
            })
        }
        let dropdown = [];
        let dropdownBottomTD = [];
        //if (this.state.ProductListShow.length > 1 || this.state.ProductListShow.length <= 3) {
        //    for (let i = 0; i < this.state.ProductListSelectionCount; i++) {
        //        dropdown.push(<th className="Compare_add_product_th" style={({ display: this.state.showdropdown ? 'table-cell' : 'none' })}>
        //            <div className="Compare_add_product">
        //                <h5>Add Product</h5>
        //                {productDropdownArray.map(formElement => (
        //                    <Input
        //                        class={formElement.config.requiredclass}
        //                        key={formElement.id}
        //                        elementType={formElement.config.elementType}
        //                        elementConfig={formElement.config.elementConfig}
        //                        label={formElement.config.label}
        //                        invalid={!formElement.config.valid}
        //                        shouldValidate={formElement.config.validation}
        //                        touched={formElement.config.touched}
        //                        errorMessage={formElement.config.errorMessage}
        //                        changed={this.handleSimple}
        //                        SelectChange={this.handleSimple}
        //                        value={formElement.config.value} />
        //                ))}
        //            </div>
        //        </th>)
        //        dropdownBottomTD.push(<td style={({ display: this.state.showdropdown ? 'table-cell' : 'none' })}></td>);
        //    }
        //}

        // let MaterialList='';
        // if(this.props.Material !==undefined){
        // for(let count = 0; count < this.props.Material.length; count++)
        // {
        //     MaterialList +=this.props.Material[count]+','            
        // }
        // MaterialList=MaterialList.slice(0,-1)
        // }
        let defaultguid = '';
        let propbadge = '';
        let statebadge = '';
        let defaultsku = ''
        let emissionvalue = '';
        let defaultemissionvalue = this.state.CarbonEmissionUnit === '' || this.state.CarbonEmissionUnit === undefined || this.state.CarbonEmissionUnit === null ? this.props.carbonEmissionUnit : this.state.CarbonEmissionUnit;
        let defaultstatebadge = (<div style={{ zIndex: '999' }} className="selected_prod_text"><span style={{ background: "linear-gradient(45deg, #2ee8b8 0%, #3e65f7 100%)", color: "#fff", padding: "5px", display: "inline-block", fontSize: "11px", borderRadius: "5px" }}>Lowest Co2 Footprint</span></div>);
        stateproductguid.map(item => {
            if (item === this.props.ProductGuid) {
                propbadge = (<div><span style={{ background: "linear-gradient(45deg, #2ee8b8 0%, #3e65f7 100%)", color: "#fff", padding: "5px", display: "inline-block", fontSize: "11px", borderRadius: "5px" }}>Lowest Co2 Footprint</span></div>);
            }
        });
        let MaterialList = null;
        if (this.props.Material !== null && this.props.Material !== "" && this.props.Material !== undefined) {
            MaterialList = this.props.Material.replace("|", ", ").trim();
        }
        let productExpired = false;
        let showproductdata = [];
        if (this.state.ProductListShow !== undefined && this.state.ProductListShow.length > 0) {
            showproductdata.push(this.state.ProductListShow.filter(x => x.productGuid === this.props.ProductGuid)[0])
            this.state.ProductListShow.filter(x => x.productGuid !== this.props.ProductGuid).map(item => {
                showproductdata.push(item)
            })
            let showproductdatacemissionwithoutzero = showproductdata.filter(x => x.carbonemissionqty > 0);
            for (let i = 0; i < showproductdatacemissionwithoutzero.length; i++) {
                if (i == 0) {
                    lowestCarbonEmission.push(showproductdatacemissionwithoutzero[i].productGuid)
                }
                else {
                    if ((showproductdatacemissionwithoutzero[i].carbonemissionqty != null && showproductdatacemissionwithoutzero[i].carbonemissionqty != undefined) && (showproductdatacemissionwithoutzero.filter(x => x.productGuid == lowestCarbonEmission[0])[0].carbonemissionqty != null && showproductdatacemissionwithoutzero.filter(x => x.productGuid == lowestCarbonEmission[0])[0].carbonemissionqty != undefined)) {
                        if (parseFloat(showproductdatacemissionwithoutzero[i].carbonemissionqty) < parseFloat(showproductdatacemissionwithoutzero.filter(x => x.productGuid == lowestCarbonEmission[0])[0].carbonemissionqty)) {
                            lowestCarbonEmission = [];
                            lowestCarbonEmission.push(showproductdatacemissionwithoutzero[i].productGuid);
                        }
                        else if (parseFloat(showproductdatacemissionwithoutzero[i].carbonemissionqty) == parseFloat(showproductdatacemissionwithoutzero.filter(x => x.productGuid == lowestCarbonEmission[0])[0].carbonemissionqty)) {
                            lowestCarbonEmission.push(showproductdatacemissionwithoutzero[i].productGuid);
                        }
                    }
                }
            }
            let showproductdatatemissionwithoutzero = showproductdata.filter(x => x.transportEmission > 0);
            for (let i = 0; i < showproductdatatemissionwithoutzero.length; i++) {
                if (i == 0) {
                    lowestTransportEmission.push(showproductdatatemissionwithoutzero[i].productGuid)
                }
                else {
                    if ((showproductdatatemissionwithoutzero[i].transportEmission != null && showproductdatatemissionwithoutzero[i].transportEmission != undefined) && (showproductdatatemissionwithoutzero.filter(x => x.productGuid == lowestTransportEmission[0])[0].transportEmission != null && showproductdatatemissionwithoutzero.filter(x => x.productGuid == lowestTransportEmission[0])[0].transportEmission != undefined)) {
                        if (parseFloat(showproductdatatemissionwithoutzero[i].transportEmission) < parseFloat(showproductdatatemissionwithoutzero.filter(x => x.productGuid == lowestTransportEmission[0])[0].transportEmission)) {
                            lowestTransportEmission = [];
                            lowestTransportEmission.push(showproductdatatemissionwithoutzero[i].productGuid);
                        }
                        else if (parseFloat(showproductdatatemissionwithoutzero[i].transportEmission) == parseFloat(showproductdatatemissionwithoutzero.filter(x => x.productGuid == lowestTransportEmission[0])[0].transportEmission)) {
                            lowestTransportEmission.push(showproductdatatemissionwithoutzero[i].productGuid);
                        }
                    }
                }
            }
            for (let i = 0; i < showproductdata.length; i++) {
                if (i == 0) {
                    lowestPlasticWeight.push(showproductdata[i].productGuid)
                    lowestLeadTime.push(showproductdata[i].productGuid)
                    lowestPrice.push(showproductdata[i].productGuid)
                    lowestMoq.push(showproductdata[i].productGuid)
                    highestescore.push(showproductdata[i].productGuid)
                    highestsscore.push(showproductdata[i].productGuid)
                    highestgscore.push(showproductdata[i].productGuid)
                }
                else {
                    if ((showproductdata[i].plasticWeight != null && showproductdata[i].plasticWeight != undefined) && (showproductdata.filter(x => x.productGuid == lowestPlasticWeight[0])[0].plasticWeight != null && showproductdata.filter(x => x.productGuid == lowestPlasticWeight[0])[0].plasticWeight != undefined)) {
                        if (parseFloat(showproductdata[i].plasticWeight) < parseFloat(showproductdata.filter(x => x.productGuid == lowestPlasticWeight[0])[0].plasticWeight)) {
                            lowestPlasticWeight = [];
                            lowestPlasticWeight.push(showproductdata[i].productGuid);
                        }
                        else if (parseFloat(showproductdata[i].plasticWeight) == parseFloat(showproductdata.filter(x => x.productGuid == lowestPlasticWeight[0])[0].plasticWeight)) {
                            lowestPlasticWeight.push(showproductdata[i].productGuid);
                        }
                    }
                    if ((showproductdata[i].leadtimeqty != null && showproductdata[i].leadtimeqty != undefined) && (showproductdata.filter(x => x.productGuid == lowestLeadTime[0])[0].leadtimeqty != null && showproductdata.filter(x => x.productGuid == lowestLeadTime[0])[0].leadtimeqty != undefined)) {
                        if (parseFloat(showproductdata[i].leadtimeqty) < parseFloat(showproductdata.filter(x => x.productGuid == lowestLeadTime[0])[0].leadtimeqty)) {
                            lowestLeadTime = [];
                            lowestLeadTime.push(showproductdata[i].productGuid)
                        }
                        else if (parseFloat(showproductdata[i].leadtimeqty) == parseFloat(showproductdata.filter(x => x.productGuid == lowestLeadTime[0])[0].leadtimeqty)) {
                            lowestLeadTime.push(showproductdata[i].productGuid)
                        }
                    }
                    if ((showproductdata[i].priceqty != null && showproductdata[i].priceqty != undefined) && (showproductdata.filter(x => x.productGuid == lowestPrice[0])[0].priceqty != null && showproductdata.filter(x => x.productGuid == lowestPrice[0])[0].priceqty != undefined)) {
                        if (parseFloat(showproductdata[i].priceqty) < parseFloat(showproductdata.filter(x => x.productGuid == lowestPrice[0])[0].priceqty)) {
                            lowestPrice = [];
                            lowestPrice.push(showproductdata[i].productGuid);
                        }
                        else if (parseFloat(showproductdata[i].priceqty) == parseFloat(showproductdata.filter(x => x.productGuid == lowestPrice[0])[0].priceqty)) {
                            lowestPrice.push(showproductdata[i].productGuid);
                        }
                    }
                    if ((showproductdata[i].mOQ != null && showproductdata[i].mOQ != undefined) && (showproductdata.filter(x => x.productGuid == lowestMoq[0])[0].mOQ != null && showproductdata.filter(x => x.productGuid == lowestMoq[0])[0].mOQ != undefined)) {
                        if (parseFloat(showproductdata[i].mOQ) < parseFloat(showproductdata.filter(x => x.productGuid == lowestMoq[0])[0].mOQ)) {
                            lowestMoq = [];
                            lowestMoq.push(showproductdata[i].productGuid);
                        }
                        else if (parseFloat(showproductdata[i].mOQ) == parseFloat(showproductdata.filter(x => x.productGuid == lowestMoq[0])[0].mOQ)) {
                            lowestMoq.push(showproductdata[i].productGuid);
                        }
                    }
                    if ((showproductdata[i].eScore != null && showproductdata[i].eScore != undefined) && (showproductdata.filter(x => x.productGuid == highestescore[0])[0].eScore != null && showproductdata.filter(x => x.productGuid == highestescore[0])[0].eScore != undefined)) {
                        if (parseFloat(showproductdata[i].eScore) > parseFloat(showproductdata.filter(x => x.productGuid == highestescore[0])[0].eScore)) {
                            highestescore = []
                            highestescore.push(showproductdata[i].productGuid)
                        }
                        else if (parseFloat(showproductdata[i].eScore) == parseFloat(showproductdata.filter(x => x.productGuid == highestescore[0])[0].eScore)) {
                            highestescore.push(showproductdata[i].productGuid)
                        }
                    }
                    if ((showproductdata[i].sScore != null && showproductdata[i].sScore != undefined) && (showproductdata.filter(x => x.productGuid == highestsscore[0])[0].sScore != null && showproductdata.filter(x => x.productGuid == highestsscore[0])[0].sScore != undefined)) {
                        if (parseFloat(showproductdata[i].sScore) > parseFloat(showproductdata.filter(x => x.productGuid == highestsscore[0])[0].sScore)) {
                            highestsscore = []
                            highestsscore.push(showproductdata[i].productGuid)
                        }
                        else if (parseFloat(showproductdata[i].sScore) == parseFloat(showproductdata.filter(x => x.productGuid == highestsscore[0])[0].sScore)) {
                            highestsscore.push(showproductdata[i].productGuid)
                        }
                    }
                    if ((showproductdata[i].gScore != null && showproductdata[i].gScore != undefined) && (showproductdata.filter(x => x.productGuid == highestgscore[0])[0].gScore != null && showproductdata.filter(x => x.productGuid == highestgscore[0])[0].gScore != undefined)) {
                        if (parseFloat(showproductdata[i].gScore) > parseFloat(showproductdata.filter(x => x.productGuid == highestgscore[0])[0].gScore)) {
                            highestgscore = []
                            highestgscore.push(showproductdata[i].productGuid)
                        }
                        else if (parseFloat(showproductdata[i].gScore) == parseFloat(showproductdata.filter(x => x.productGuid == highestgscore[0])[0].gScore)) {
                            highestgscore.push(showproductdata[i].productGuid)
                        }
                    }

                }
            }
        }
        let dropdownoption = [], productguids = '';
        for (let i = 0; i < showproductdata.filter(x => x.productGuid !== this.props.ProductGuid).length; i++) {
            productDropdownArray.map(formElement => {
                formElement.config.elementConfig.options.map(items => {
                    productguids = showproductdata.filter(x => x.productGuid !== this.props.ProductGuid)[i].productGuid;
                    dropdownoption.push({
                        "dropdown": <span onClick={() => this.replaceproduct(items.Id, productguids)} style={{ 'cursor': 'pointer' }}>
                            {items.Value}
                        </span>,
                        "productGuid": productguids
                    })
                })
            })
        }
        let defaultskuguid = '', plasticweightunit = '';
        if (showproductdata !== undefined && showproductdata.length > 0) {
            return (
                this.state.isblank ? < div > <Spinner /></div > :
                <div className="compare_products_main">
                    {/* <h4>Compare Similar Products</h4> */}
                    <div className="cmprprodpopup_cont">
                        <h1 className="cmprprodpop_name">Compare Product - {this.props.ProductName}</h1>
                        {/*<div className="cmprprodpop_prodtype">*/}
                        {/*    <span>Type : </span>*/}
                        {/*    <span>{this.props.alldata != undefined && this.props.alldata != null && this.props.alldata != "" ? this.props.alldata.listProductSubCategory.length > 0 ? this.props.alldata.listProductSubCategory[0]["producttypename.raw"] != undefined && this.props.alldata.listProductSubCategory[0]["producttypename.raw"] != null && this.props.alldata.listProductSubCategory[0]["producttypename.raw"] != "" ? this.props.alldata.listProductSubCategory[0]["producttypename.raw"] : "" : "" : ""}</span>*/}
                        {/*</div>*/}
                    </div>
                    <div className="comparetop_btns">
                        <h5>Sort comparison by</h5>
                        <ul>
                            {/* <li className={this.state.showPreference === 'showReview' ? "pref_selected" : ""} onClick={(event) => this.getDataBySelection(event, 'Review')}>REVIEW</li> */}
                            {showproductdata.length > 0 && (this.props.quantityname === "Gram" || this.props.quantityname === "Kilogram" || this.props.quantityname === "Pieces" || this.props.quantityname === "Pound" || this.props.quantityname === "Metric Tonnes") ?
                                <React.Fragment>
                                    <li className={this.state.showPreference === 'showCFprint' ? "pref_selected" : ""} onClick={(event) => this.getDataBySelection(event, 'CFprint')}>Product CO<sub>2</sub>e</li>
                                    <li className={this.state.showPreference === 'showTEprint' ? "pref_selected" : ""} onClick={(event) => this.getDataBySelection(event, 'TEprint')}>Transport CO<sub>2</sub>e</li>
                                    <li className={this.state.showPreference === 'showpWeight' ? "pref_selected" : ""} onClick={(event) => this.getDataBySelection(event, 'pWeight')}>Plastic Weight</li>
                                    {/*<li className={this.state.showPreference === 'showCCperkg' ? "pref_selected" : ""} onClick={(event) => this.getDataBySelection(event, 'CCperkg')}>Carbon Cost ({this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? 'Per ' + this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] : ""})</li>*/}
                                    {/*<li className={this.state.showPreference === 'showCAcperkg' ? "pref_selected" : ""} onClick={(event) => this.getDataBySelection(event, 'CAcperkg')}>Carbon Adjusted Cost ({this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? 'Per ' + this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] : ""})</li>*/}
                                </React.Fragment>
                                : ""}
                            <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>
                                <div className="amt_breakup_tooltip">
                                    <div>
                                        <span>Environment Score</span>
                                    </div>
                                </div>
                            </div>}>
                                <li className={this.state.showPreference === 'showEnvironment' ? "pref_selected escore" : "escore"} onClick={(event) => this.getDataBySelection(event, 'Environment')}>E Score</li>
                            </Tooltip>
                            <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>
                                <div className="amt_breakup_tooltip">
                                    <div>
                                        <span>Social Score</span>
                                    </div>
                                </div>
                            </div>}>
                                <li className={this.state.showPreference === 'showSocial' ? "pref_selected sscore" : " sscore"} onClick={(event) => this.getDataBySelection(event, 'Social')}><span>S Score</span></li>
                            </Tooltip>
                            <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>
                                <div className="amt_breakup_tooltip">
                                    <div>
                                        <span>Governance Score</span>
                                    </div>
                                </div>
                            </div>}>
                                <li className={this.state.showPreference === 'showGovernance' ? "pref_selected gscore" : "gscore"} onClick={(event) => this.getDataBySelection(event, 'Governance')}>G Score</li>
                            </Tooltip>
                            <li className={this.state.showPreference === 'showMinPrice' ? "pref_selected" : ""} onClick={(event) => this.getDataBySelection(event, 'MinPrice')}>Price</li>
                            <li className={this.state.showPreference === 'showLeadTime' ? "pref_selected" : ""} onClick={(event) => this.getDataBySelection(event, 'LeadTime')}>Lead Time</li>
                            <li className={this.state.showPreference === 'showMOQ' ? "pref_selected" : ""} onClick={(event) => this.getDataBySelection(event, 'MOQ')}>MOQ</li>
                        </ul>
                    </div>
                    <table className={showproductdata.length > 2 ? "compare_products_table" : "compare_products_table twocolcmprprod_tbl"}>
                        <thead>
                            <tr>
                                <th>
                                    <div className="qickcmpr_cont">
                                        <h5>Quick Comparison</h5>
                                        <div className="qickcmpr_fields">
                                            <Input elementType='input_2'
                                                invalid={true}
                                                touched={true}
                                                shouldValidate={true}
                                                newThemeError={this.state.newThemeError} value={this.state.productqty}
                                                class="newInput_2"
                                                onKeyPress={(event) => this.enterkeyproceed(event)}
                                                changed={(event) => this.changequantity(event, this.props.quantityname)}
                                                label="Enter quantity" />
                                            <Button onClick={() => this.enteredquantitycalculation()}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                    <path d="M4 3.99993V8.99993H4.582M4.582 8.99993C5.24585 7.35806 6.43568 5.98284 7.96503 5.08979C9.49438 4.19674 11.2768 3.83634 13.033 4.06507C14.7891 4.29379 16.4198 5.09872 17.6694 6.3537C18.919 7.60869 19.7168 9.24279 19.938 10.9999M4.582 8.99993H9M20 19.9999V14.9999H19.419M19.419 14.9999C18.7542 16.6408 17.564 18.015 16.0348 18.9072C14.5056 19.7995 12.7237 20.1594 10.9681 19.9308C9.21246 19.7022 7.5822 18.8978 6.33253 17.6437C5.08287 16.3895 4.28435 14.7564 4.062 12.9999M19.419 14.9999H15" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>
                                            </Button>
                                        </div>
                                    </div>
                                </th>
                                {/* <th className="selected_compare_prod tradersheadth"> */}
                                {/* <div className="most_recomm_product">
                                    <img alt=" " src={recomStar}/>
                                    <span>Most recommended</span>
                                </div> */}
                                {/* <div className="traders_cont"> */}
                                {/* <div className="cmprsuppliertxt">Supplier</div> */}


                                {/* <div className="cmprsuppliertxt">
                                            <ProductGreenProperties isCompare={true} GreenProperties={this.props.GreenProperties} GreenPropertiesIcon={this.props.GreenPropertiesIcon} greenpropertiesmaster={this.props.greenpropertiesmaster} />
                                        </div> */}
                                {/*<div className="selected_prod_text">*/}
                                {/*    */}{/*<p>Selected Product</p>*/}
                                {/*    {propbadge}*/}
                                {/*</div>*/}
                                {/*<div className="new_bw_icons">*/}
                                {/*    {this.props.NewArrival === "New Arrival" ? <div className="new_relase_icon">*/}
                                {/*        <span>NEW</span>*/}
                                {/*    </div> : null}*/}
                                {/*    {this.props.BuyingWindowStatus === "Buying Window" ?*/}
                                {/*        <div className="bw_filter"><span>BW</span></div> : ""}*/}
                                {/*</div>*/}
                                {/*<div className="Compare_product_img">*/}
                                {/*    {this.props.isProductExpired === true ? <div className="prod_type_deac_expi">  <div className="expired_prod">*/}
                                {/*        <RemoveCircle /><span>EXPIRED</span>*/}
                                {/*    </div>  </div> : ''}*/}
                                {/*    <img alt=" " src={awsUrl + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + this.props.ImageName} onError={(e) => { e.target.onerror = null; e.target.src = awsUrl + "ProductImages/Thumbnail/default.jpg" }} />*/}
                                {/*    */}{/* <img alt=" " className="prod_recycle" src={Recycle}/> */}
                                {/*</div>*/}
                                {/* <div className="compare_prodname">
                                            <h5>{this.props.CompanyName}</h5>
                                        </div> */}
                                {/* {(this.state.orderby === 'CFprint') ?
                                            showproductdata.filter(x => x.carbonEmission > 0).length > 0 && this.props.CarbonEmission > 0 ?
                                                <div className="compare_carbfootval">
                                                    <span className="cbfootprintval">{this.state.CarbonEmissionUnit == '' ? this.props.CarbonEmission : this.state.CarbonEmission}</span>
                                                    <span className="cbfootprintunit" dangerouslySetInnerHTML={{ __html: defaultemissionvalue }}></span>
                                                </div>

                                                : <div className="compare_carbfootval">
                                                    <span className="cbfootprintval">-</span>
                                                </div>
                                            :
                                            (this.state.orderby === 'MOQ') ?
                                                this.props.MOQ > 0 ?
                                                    <div className="compare_carbfootval">
                                                        <span className="cbfootprintval">{this.props.MOQ}</span>
                                                    </div>
                                                    : <div className="compare_carbfootval">
                                                        <span className="cbfootprintval">-</span>
                                                    </div>
                                                : (this.state.orderby === 'LeadTime') ?
                                                    this.props.MinLeadTime > 0 ?
                                                        <div className="compare_carbfootval">
                                                            <span className="cbfootprintval">{this.props.MinLeadTime}</span>                                                        </div>
                                                        : <div className="compare_carbfootval">
                                                            <span className="cbfootprintval">-</span>
                                                        </div>
                                                    :
                                                    (this.state.orderby === 'MinPrice') ?
                                                        this.props.ProductPrice > 0 ?
                                                            <div className="compare_carbfootval">
                                                                <span className="cbfootprintval">{this.props.CurrencySymbol}{this.props.ProductPrice}</span>
                                                            </div>
                                                            : <div className="compare_carbfootval">
                                                                <span className="cbfootprintval">-</span>
                                                            </div>
                                                        : ''
                                        } */}

                                {/* </div>
                                </th> */}

                                {showproductdata.length > 0 ?
                                    showproductdata.map((x) => (
                                        // emissionvalue = this.state.isblank ? this.props.carbonEmissionUnit : this.state.CarbonEmissionUnit,
                                        emissionvalue = this.state.CarbonEmissionUnit === '' || this.state.CarbonEmissionUnit === undefined || this.state.CarbonEmissionUnit === null ? this.props.carbonEmissionUnit : this.state.CarbonEmissionUnit,
                                        statebadge = stateproductguid.filter((item) => item === x.productGuid).length > 0 ? defaultstatebadge : '',
                                        defaultsku = x.listRateCardVM.filter(y => y.isDefault == true).length > 0 ? x.listRateCardVM.filter(y => y.isDefault == true)[0].skuGuid : '00000000-0000-0000-0000-000000000000',
                                        x.productGuid === this.props.ProductGuid ?
                                            <th className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_compare_prod tradersheadth" : "tradersheadth"}>
                                                <div className="traders_cont">
                                                    {/* <div className="cmprsuppliertxt">Supplier</div> */}

                                                    {/* {showproductdata.length > 2 === true ?
                                                        x.productGuid === this.props.ProductGuid ? '' :

                                                            <button className="removecmpr_product" onClick={(event) => this.addItemsProductListShow(event, x.productGuid)}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                                    <path d="M1 1L11 11M1 11L11 1L1 11Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                                </svg>
                                                            </button>
                                                        : ''} */}
                                                    <div className="cmprsuppliertxtselect" style={{ background: "#07ABAB" }}>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '15px' }}>
                                                            <span className="cmprclaimsname">Selected</span>
                                                        </div>
                                                    </div>
                                                    {/*<ProductGreenProperties isCompare={true} GreenProperties={x["listproductgreenproperties.raw"]} GreenPropertiesIcon={x["productgreenproperties.raw"]} greenpropertiesmaster={this.props.greenpropertiesmaster} />*/}
                                                    {lowestTransportEmission.filter(z => z == x.productGuid).length > 0
                                                        && lowestCarbonEmission.filter(z => z == x.productGuid).length > 0
                                                        && lowestPlasticWeight.filter(z => z == x.productGuid).length > 0
                                                        && lowestLeadTime.filter(z => z == x.productGuid).length > 0
                                                        && lowestPrice.filter(z => z == x.productGuid).length > 0
                                                        && lowestMoq.filter(z => z == x.productGuid).length > 0
                                                        && highestescore.filter(z => z == x.productGuid).length > 0
                                                        && highestsscore.filter(z => z == x.productGuid).length > 0
                                                        && highestgscore.filter(z => z == x.productGuid).length > 0 ?
                                                        <div className="cmprsuppliertxt" style={{ left: '100px' }}>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '15px' }}>
                                                                <span className="cmprclaimsname">Recommended</span>
                                                            </div> </div> : ""}
                                                    {/*<div className="selected_prod_text">*/}
                                                    {/*    */}{/*<p>Selected Product</p>*/}
                                                    {/*    {propbadge}*/}
                                                    {/*</div>*/}
                                                    {/*<div className="new_bw_icons">*/}
                                                    {/*    {this.props.NewArrival === "New Arrival" ? <div className="new_relase_icon">*/}
                                                    {/*        <span>NEW</span>*/}
                                                    {/*    </div> : null}*/}
                                                    {/*    {this.props.BuyingWindowStatus === "Buying Window" ?*/}
                                                    {/*        <div className="bw_filter"><span>BW</span></div> : ""}*/}
                                                    {/*</div>*/}
                                                    {/*<div className="Compare_product_img">*/}
                                                    {/*    {this.props.isProductExpired === true ? <div className="prod_type_deac_expi">  <div className="expired_prod">*/}
                                                    {/*        <RemoveCircle /><span>EXPIRED</span>*/}
                                                    {/*    </div>  </div> : ''}*/}
                                                    {/*    <img alt=" " src={awsUrl + "ProductImages/" + this.props.SupplierGuid.toUpperCase() + "/Thumbnail/" + this.props.ImageName} onError={(e) => { e.target.onerror = null; e.target.src = awsUrl + "ProductImages/Thumbnail/default.jpg" }} />*/}
                                                    {/*    */}{/* <img alt=" " className="prod_recycle" src={Recycle}/> */}
                                                    {/*</div>*/}
                                                    <div className="compare_prodname">
                                                        <h5>{x.companyName}</h5>
                                                    </div>
                                                    {/*//*******/}
                                                    {
                                                        (this.state.orderby === 'Environment') ?
                                                            showproductdata.filter(x => x.eScore > 0).length > 0 ?
                                                                <div className="compare_carbfootval">
                                                                    <span className="cbfootprintval">{x.eScore > 0 ? x.eScore.toFixed(2) : '-'}</span>
                                                                    <span className="cbfootprintunit">Environment Score (in %)</span>
                                                                </div>
                                                                : <div className="compare_carbfootval">
                                                                    <span className="cbfootprintval" >NA</span>
                                                                </div>
                                                            :
                                                            (this.state.orderby === 'Social') ?
                                                                showproductdata.filter(x => x.sScore > 0).length > 0 ?
                                                                    <div className="compare_carbfootval">
                                                                        <span className="cbfootprintval">{x.sScore > 0 ? x.sScore.toFixed(2) : '-'}</span>
                                                                        <span className="cbfootprintunit">Social Score (in %)</span>
                                                                    </div>
                                                                    : <div className="compare_carbfootval">
                                                                        <span className="cbfootprintval" >NA</span>
                                                                    </div>
                                                                :
                                                                (this.state.orderby === 'Governance') ?
                                                                    showproductdata.filter(x => x.gScore > 0).length > 0 ?
                                                                        <div className="compare_carbfootval">
                                                                            <span className="cbfootprintval">{x.gScore > 0 ? x.gScore.toFixed(2) : '-'}</span>
                                                                            <span className="cbfootprintunit">Governance Score (in %)</span>
                                                                        </div>
                                                                        : <div className="compare_carbfootval">
                                                                            <span className="cbfootprintval" >NA</span>
                                                                        </div>
                                                                    :
                                                                    (this.state.orderby === 'pWeight') ?
                                                                        showproductdata.filter(x => x.plasticWeight > 0).length > 0 ?
                                                                            <div className="compare_carbfootval">
                                                                                <span className="cbfootprintval">{x.plasticWeight > 0 ? x.plasticWeightUnit==="Grams" || x.plasticWeightUnit==="Kilogram" || x.plasticWeightUnit==="Pound" || x.plasticWeightUnit==="Metric Tonnes" ? convertintokg(x.plasticWeightUnit,x.plasticWeight).toFixed(2) : x.plasticWeight.toFixed(2) : '-'}</span>
                                                                                <span className="cbfootprintunit" style={{ opacity: x.plasticWeight > 0 ? 1 : 0 }}>Plastic Weight (in {x.plasticWeight > 0 ? x.plasticWeightUnit==="Grams" || x.plasticWeightUnit==="Kilogram" || x.plasticWeightUnit==="Pound" || x.plasticWeightUnit==="Metric Tonnes" ? "Kg" : x.plasticWeightUnit : 'Grams'})</span>
                                                                            </div>
                                                                            : <div className="compare_carbfootval">
                                                                                <span className="cbfootprintval" >NA</span>
                                                                                <span className="cbfootprintval" > </span>
                                                                            </div>
                                                                        :
                                                                        (this.state.orderby === 'TEprint') ?
                                                                            showproductdata.filter(y => y.transportEmission > 0 && y.productGuid == x.productGuid).length > 0 ?
                                                                                <div className="compare_carbfootval">
                                                                                    <span className="cbfootprintval">{showproductdata.filter(y => y.productGuid == x.productGuid)[0].transportEmission ? showproductdata.filter(y => y.productGuid == x.productGuid)[0].transportEmission.toFixed(2) : 0}</span>
                                                                                    <span className="cbfootprintunit" style={{ opacity: showproductdata.filter(y => y.productGuid == x.productGuid)[0].transportEmission > 0 ? 1 : 0 }}>Transport CO<sub>2</sub> (in <span className="cbfootprintunit" dangerouslySetInnerHTML={{ __html: showproductdata.filter(y => y.productGuid == x.productGuid)[0].carbonemissionunit }}></span>)</span>
                                                                                </div>
                                                                                : <div className="compare_carbfootval">
                                                                                    <span className="cbfootprintval">NA</span>
                                                                                    <span className="cbfootprintval"> </span>
                                                                                </div>
                                                                            :
                                                                            (this.state.orderby === 'CFprint') ?
                                                                                showproductdata.filter(y => y.carbonemissionqty > 0 && y.productGuid == x.productGuid).length > 0 ?
                                                                                    <div className="compare_carbfootval">
                                                                                        <span className="cbfootprintval">{showproductdata.filter(y => y.productGuid == x.productGuid)[0].carbonemissionqty > 0 ? showproductdata.filter(y => y.productGuid == x.productGuid)[0].carbonemissionqty.toFixed(2) : '-'}</span>
                                                                                        <span className="cbfootprintunit" style={{ opacity: x.carbonemissionqty > 0 ? 1 : 0 }}>Product CO<sub>2</sub> (in <span className="cbfootprintunit" dangerouslySetInnerHTML={{ __html: showproductdata.filter(y => y.productGuid == x.productGuid)[0].carbonemissionunit }}></span>)</span>
                                                                                    </div>
                                                                                    : <div className="compare_carbfootval">
                                                                                        <span className="cbfootprintval">NA</span>
                                                                                        <span className="cbfootprintval" > </span>
                                                                                    </div>
                                                                                :
                                                                                (this.state.orderby === 'MOQ') ?
                                                                                    showproductdata.filter(x => x.mOQ > 0).length > 0 ?
                                                                                        this.state.isblank === false ?
                                                                                            x.filterlength === false ?
                                                                                                x.mOQ > 0 ?
                                                                                                    <div className="compare_carbfootval">
                                                                                                        <span className="cbfootprintval">{x.mOQ}</span>
                                                                                                        <span className="cbfootprintunit">MOQ (in {this.props.quantityname})</span>
                                                                                                    </div> :

                                                                                                    <div className="compare_carbfootval">
                                                                                                        <span className="cbfootprintval">NA</span>
                                                                                                        {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                            <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                            : <span className="cbfootprintunit">
                                                                                                                <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                            </span>
                                                                                                        }
                                                                                                    </div> :
                                                                                                <div className="compare_carbfootval">
                                                                                                    <span className="cbfootprintval">{x.mOQ}</span>
                                                                                                    <span className="cbfootprintunit">MOQ (in {this.props.quantityname})</span>
                                                                                                </div> :
                                                                                            <div className="compare_carbfootval">
                                                                                                <span className="cbfootprintval">{x.mOQ}</span>
                                                                                                <span className="cbfootprintunit">MOQ (in {this.props.quantityname})</span>
                                                                                            </div>
                                                                                        : <div className="compare_carbfootval">
                                                                                            <span className="cbfootprintval">NA</span>
                                                                                            {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                : <span className="cbfootprintunit">
                                                                                                    <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                </span>
                                                                                            }
                                                                                        </div>
                                                                                    : (this.state.orderby === 'LeadTime') ?
                                                                                        showproductdata.filter(x => x.leadtimeqty > 0).length > 0 ?
                                                                                            this.state.isblank === false ?
                                                                                                x.greaterthanmoq === false ?
                                                                                                    x.filterlength === true ?
                                                                                                        x.leadtimeqty > 0 ?
                                                                                                            <div className="compare_carbfootval">
                                                                                                                <span className="cbfootprintval">{x.leadtimeqty}</span>
                                                                                                                <span className="cbfootprintunit">Lead Time (in Days)</span>
                                                                                                            </div>
                                                                                                            :
                                                                                                            <div className="compare_carbfootval">
                                                                                                                <span className="cbfootprintval">NA</span>
                                                                                                                {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                                    <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                                    : <span className="cbfootprintunit">
                                                                                                                        <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                                    </span>
                                                                                                                }
                                                                                                            </div> :
                                                                                                        x.leadtimeqty > 0 ?
                                                                                                            <div className="compare_carbfootval">
                                                                                                                <span className="cbfootprintval">{x.leadtimeqty}</span>
                                                                                                                <span className="cbfootprintunit">Lead Time (in Days)</span>
                                                                                                            </div>
                                                                                                            :
                                                                                                            <div className="compare_carbfootval">
                                                                                                                <span className="cbfootprintval">NA</span>
                                                                                                                {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                                    <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                                    : <span className="cbfootprintunit">
                                                                                                                        <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                                    </span>
                                                                                                                }
                                                                                                            </div>
                                                                                                    :
                                                                                                    x.filterlength === true ?
                                                                                                        <div className="compare_carbfootval">
                                                                                                            <span className="cbfootprintval">{x.leadtimeqty}</span>
                                                                                                            <span className="cbfootprintunit">Lead Time (in Days)</span>
                                                                                                        </div>
                                                                                                        :
                                                                                                        <div className="compare_carbfootval">
                                                                                                            <span className="cbfootprintval">NA</span>
                                                                                                            {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                                <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                                : <span className="cbfootprintunit">
                                                                                                                    <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                                </span>
                                                                                                            }
                                                                                                        </div>
                                                                                                :
                                                                                                x.leadtimeqty > 0 ?
                                                                                                    <div className="compare_carbfootval">
                                                                                                        <span className="cbfootprintval">{x.leadtimeqty}</span>
                                                                                                        <span className="cbfootprintunit">Lead Time (in Days)</span>
                                                                                                    </div> :
                                                                                                    <div className="compare_carbfootval">
                                                                                                        <span className="cbfootprintval">NA</span>
                                                                                                        {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                            <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                            : <span className="cbfootprintunit">
                                                                                                                <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                            </span>
                                                                                                        }
                                                                                                    </div>
                                                                                            : <div className="compare_carbfootval">
                                                                                                <span className="cbfootprintval">NA</span>
                                                                                                {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                    <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                    : <span className="cbfootprintunit">
                                                                                                        <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                    </span>
                                                                                                }
                                                                                            </div>
                                                                                        :
                                                                                        (this.state.orderby === 'MinPrice') ?
                                                                                            showproductdata.filter(x => x.priceqty > 0).length > 0 ?
                                                                                                this.state.isblank === false ?
                                                                                                    x.greaterthanmoq === false ?
                                                                                                        x.filterlength === true ?
                                                                                                            x.priceqty > 0 ?
                                                                                                                <div className="compare_carbfootval">
                                                                                                                    <span className="cbfootprintval">{x.priceqty}</span>
                                                                                                                    <span className="cbfootprintunit">Price (in {QuantityUnit})</span>
                                                                                                                </div>
                                                                                                                :
                                                                                                                <div className="compare_carbfootval">
                                                                                                                    <span className="cbfootprintval">NA</span>
                                                                                                                    {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                                        <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                                        : <span className="cbfootprintunit">
                                                                                                                            <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                                        </span>
                                                                                                                    }
                                                                                                                </div> :
                                                                                                            x.priceqty > 0 ?
                                                                                                                <div className="compare_carbfootval">
                                                                                                                    <span className="cbfootprintval">{x.priceqty}</span>
                                                                                                                    <span className="cbfootprintunit">Price (in {QuantityUnit})</span>
                                                                                                                </div>
                                                                                                                :
                                                                                                                <div className="compare_carbfootval">
                                                                                                                    <span className="cbfootprintval">NA</span>
                                                                                                                    {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                                        <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                                        : <span className="cbfootprintunit">
                                                                                                                            <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                                        </span>
                                                                                                                    }
                                                                                                                </div>
                                                                                                        :
                                                                                                        x.filterlength === true ?
                                                                                                            <div className="compare_carbfootval">
                                                                                                                <span className="cbfootprintval">{x.priceqty}</span>
                                                                                                                <span className="cbfootprintunit">Price (in {QuantityUnit})</span>
                                                                                                            </div>
                                                                                                            :
                                                                                                            <div className="compare_carbfootval">
                                                                                                                <span className="cbfootprintval">NA</span>
                                                                                                                {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                                    <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                                    : <span className="cbfootprintunit">
                                                                                                                        <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                                    </span>
                                                                                                                }
                                                                                                            </div>
                                                                                                    :
                                                                                                    x.priceqty > 0 ?
                                                                                                        <div className="compare_carbfootval">
                                                                                                            <span className="cbfootprintval">{x.priceqty}</span>
                                                                                                            <span className="cbfootprintunit">Price (in {QuantityUnit})</span>
                                                                                                        </div> :
                                                                                                        <div className="compare_carbfootval">
                                                                                                            <span className="cbfootprintval">NA</span>
                                                                                                            {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                                <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                                : <span className="cbfootprintunit">
                                                                                                                    <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                                </span>
                                                                                                            }
                                                                                                        </div>
                                                                                                : <div className="compare_carbfootval">
                                                                                                    <span className="cbfootprintval">NA</span>
                                                                                                    {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                        <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                        : <span className="cbfootprintunit">
                                                                                                            <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                        </span>
                                                                                                    }
                                                                                                </div> : ''
                                                    }
                                                    <div className="compare_co2Emission">
                                                        <span>Total CO<sub>2</sub>e : <b>{parseFloat(x.totalEmission) > 0 ? x.totalEmission.toFixed(2) : 0} <span dangerouslySetInnerHTML={{ __html: x.carbonemissionunit }}></span></b></span>
                                                        {parseFloat(x.totalEmission) > 0 ?
                                                            <React.Fragment>
                                                                <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>
                                                                    <div className="amt_breakup_tooltip">
                                                                        {parseFloat(x.carbonemissionqty) > 0 ?
                                                                            <React.Fragment>
                                                                                <div>
                                                                                    <span>Product CO<sub>2</sub>e : </span>
                                                                                    <span>{x.carbonemissionqty.toFixed(2)} <span dangerouslySetInnerHTML={{ __html: x.carbonemissionunit }}></span></span>
                                                                                </div>
                                                                            </React.Fragment>
                                                                            : ""}
                                                                        {parseFloat(x.transportEmission) > 0 ?
                                                                            <React.Fragment>
                                                                                <div>
                                                                                    <span>Transport CO<sub>2</sub>e : </span>
                                                                                    <span>{x.transportEmission.toFixed(2)} <span dangerouslySetInnerHTML={{ __html: x.carbonemissionunit }}></span></span>
                                                                                </div>
                                                                            </React.Fragment>
                                                                            : ""}
                                                                    </div>
                                                                </div>}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                                        <g opacity="0.4">
                                                                            <path d="M8.66667 10.6667H8V8H7.33333M8 5.33333H8.00667M14 8C14 8.78793 13.8448 9.56815 13.5433 10.2961C13.2417 11.0241 12.7998 11.6855 12.2426 12.2426C11.6855 12.7998 11.0241 13.2417 10.2961 13.5433C9.56815 13.8448 8.78793 14 8 14C7.21207 14 6.43185 13.8448 5.7039 13.5433C4.97595 13.2417 4.31451 12.7998 3.75736 12.2426C3.20021 11.6855 2.75825 11.0241 2.45672 10.2961C2.15519 9.56815 2 8.78793 2 8C2 6.4087 2.63214 4.88258 3.75736 3.75736C4.88258 2.63214 6.4087 2 8 2C9.5913 2 11.1174 2.63214 12.2426 3.75736C13.3679 4.88258 14 6.4087 14 8Z" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                                                                        </g>
                                                                    </svg>
                                                                </Tooltip>
                                                            </React.Fragment>
                                                            : ""}
                                                    </div>

                                                    {/*//*******/}
                                                </div>
                                                {/*<div>*/}
                                                {/*    <div className="new_bw_icons">*/}
                                                {/*        {x["newarrival_raw.raw"] === undefined ? null : x["newarrival_raw.raw"] === "New Arrival" ? <div className="new_relase_icon"><span>NEW</span></div> : null}*/}
                                                {/*        {x["buyingwindowstatus.raw"] === undefined ? "" : x["buyingwindowstatus.raw"] === "Buying Window" ? <div className="bw_filter"><span>BW</span></div> : ""}*/}
                                                {/*    </div>*/}
                                                {/*    {statebadge}*/}
                                                {/*    {showproductdata.length > 1 === true ?*/}
                                                {/*        <div className="remove_compare_product" onClick={(event) => this.addItemsProductListShow(event, x.productGuid)} style={({ display: this.state.ProductList.length <= 2 ? 'none' : 'block' })}><Clear /></div>*/}
                                                {/*        : ''}*/}
                                                {/*    <Link className="" key={x.productGuid} to={'/product-details?product=' + x.productGuid}>*/}
                                                {/*        <div className="Compare_product_img">*/}
                                                {/*             {x.isProductExpired === 1 ?  */}
                                                {/*            {x.listProductCountryVM.length > 0 ?*/}
                                                {/*                x.listProductCountryVM.filter(t => t.countryGuid === this.props.userCountry)[0].isProductExpired === "Yes" :*/}
                                                {/*                (x.listRateCardVM.filter(t => t.productGuid === x.productGuid && t.countryGuid === this.props.userCountry).length === x.listRateCardVM.filter(t => t.productGuid === x.productGuid && t.countryGuid === this.props.userCountry && t.isPriceExpired === true).length) ?*/}
                                                {/*                    <div className="prod_type_deac_expi">  <div className="expired_prod">*/}
                                                {/*                        <RemoveCircle /><span>EXPIRED</span>*/}
                                                {/*                    </div>  </div>*/}
                                                {/*                    : ''}*/}
                                                {/*             : ''} */}
                                                {/*            <img alt=" " src={awsUrl + "ProductImages/" + x.supplierGuid.toUpperCase() + "/Thumbnail/" + x.imageName} onError={(e) => { e.target.onerror = null; e.target.src = awsUrl + "ProductImages/Thumbnail/default.jpg" }} />*/}
                                                {/*             <img alt=" " className="prod_recycle" src={Recycle}/> */}

                                                {/*        </div>*/}
                                                {/*        <div className="Compare_product_name">*/}
                                                {/*            {x.listProductVariantsVM.filter(x => x.skuGuid == defaultsku).length > 0 ?*/}
                                                {/*                <React.Fragment>*/}
                                                {/*                    <h5>{x.listProductVariantsVM.filter(x => x.skuGuid == defaultsku)[0].carbonEmission} {this.props.carbonEmissionUnit}</h5>*/}
                                                {/*                </React.Fragment>*/}
                                                {/*                :*/}
                                                {/*                ""*/}
                                                {/*            }*/}
                                                {/*        </div>*/}
                                                {/*        <div className="Compare_product_name">*/}
                                                {/*            <h5>{x.companyName}</h5>*/}
                                                {/*        </div>*/}
                                                {/*    </Link>*/}
                                                {/*</div>*/}
                                            </th>
                                            :
                                            <th className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_compare_prod tradersheadth" : "tradersheadth"}>
                                                <div className="traders_cont">
                                                    {/*{showproductdata.length > 2 === true ?*/}
                                                    {/*   x.productGuid === this.props.ProductGuid ? '' :*/}
                                                    {/*       <button className="removecmpr_product" onClick={(event) => this.addItemsProductListShow(event, x.productGuid)}>*/}
                                                    {/*           <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">*/}
                                                    {/*               <path d="M1 1L11 11M1 11L11 1L1 11Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />*/}
                                                    {/*           </svg>*/}
                                                    {/*       </button>*/}
                                                    {/*   : ''} */}
                                                    {/*<div className="cmprsuppliertxt">*/}
                                                    {/*    <ProductGreenProperties isCompare={true} GreenProperties={x["listproductgreenproperties.raw"]} GreenPropertiesIcon={x["productgreenproperties.raw"]} greenpropertiesmaster={this.props.greenpropertiesmaster} />*/}
                                                    {/*</div>*/}
                                                    {lowestTransportEmission.filter(z => z == x.productGuid).length > 0
                                                        && lowestCarbonEmission.filter(z => z == x.productGuid).length > 0
                                                        && lowestPlasticWeight.filter(z => z == x.productGuid).length > 0
                                                        && lowestLeadTime.filter(z => z == x.productGuid).length > 0
                                                        && lowestPrice.filter(z => z == x.productGuid).length > 0
                                                        && lowestMoq.filter(z => z == x.productGuid).length > 0
                                                        && highestescore.filter(z => z == x.productGuid).length > 0
                                                        && highestsscore.filter(z => z == x.productGuid).length > 0
                                                        && highestgscore.filter(z => z == x.productGuid).length > 0 ?
                                                        <div className="cmprsuppliertxt">
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '15px' }}>
                                                                <span className="cmprclaimsname">Recommended</span>
                                                            </div>
                                                        </div>
                                                        : ""}
                                                    <div className="compare_prodname">
                                                        <h5>{x.companyName}</h5>
                                                        {dropdownoption.filter(t => t.productGuid == x.productGuid).length > 0 ?
                                                            <React.Fragment>
                                                                <ExpandMore
                                                                    aria-owns={open ? 'compare_popper' : undefined}
                                                                    aria-haspopup="true"
                                                                    variant="contained"
                                                                    onClick={(event) => this.handleClickComparePopover(event, x.productGuid)}
                                                                    className="compareOpenPopover"
                                                                />

                                                            </React.Fragment>
                                                            : ""}
                                                    </div>
                                                    {/*//*******/}
                                                    {
                                                        (this.state.orderby === 'Environment') ?
                                                            showproductdata.filter(x => x.eScore > 0).length > 0 ?
                                                                <div className="compare_carbfootval">
                                                                    <span className="cbfootprintval">{x.eScore > 0 ? x.eScore.toFixed(2) : '-'}
                                                                        <span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }}>GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span>
                                                                    </span>
                                                                    <span className="cbfootprintunit">Environment Score (in %)</span>
                                                                </div>
                                                                : <div className="compare_carbfootval">
                                                                    <span className="cbfootprintval" >NA <span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                </div>
                                                            :
                                                            (this.state.orderby === 'Social') ?
                                                                showproductdata.filter(x => x.sScore > 0).length > 0 ?
                                                                    <div className="compare_carbfootval">
                                                                        <span className="cbfootprintval">{x.sScore > 0 ? x.sScore.toFixed(2) : '-'}
                                                                            <span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span>
                                                                        </span>
                                                                        <span className="cbfootprintunit">Social Score (in %)</span>
                                                                    </div>
                                                                    : <div className="compare_carbfootval">
                                                                        <span className="cbfootprintval" >NA <span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                    </div>
                                                                :
                                                                (this.state.orderby === 'Governance') ?
                                                                    showproductdata.filter(x => x.gScore > 0).length > 0 ?
                                                                        <div className="compare_carbfootval">
                                                                            <span className="cbfootprintval">{x.gScore > 0 ? x.gScore.toFixed(2) : '-'}
                                                                                <span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span>
                                                                            </span>
                                                                            <span className="cbfootprintunit">Governance Score (in %)</span>
                                                                        </div>
                                                                        : <div className="compare_carbfootval">
                                                                            <span className="cbfootprintval" >NA <span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                        </div>
                                                                    :
                                                                    (this.state.orderby === 'pWeight') ?
                                                                        showproductdata.filter(x => x.plasticWeight > 0).length > 0 ?
                                                                            <div className="compare_carbfootval">
                                                                                <span className="cbfootprintval">{x.plasticWeight > 0 ? x.plasticWeightUnit==="Grams" || x.plasticWeightUnit==="Kilogram" || x.plasticWeightUnit==="Pound" || x.plasticWeightUnit==="Metric Tonnes" ? convertintokg(x.plasticWeightUnit,x.plasticWeight).toFixed(2) : x.plasticWeight.toFixed(2) : '-'}<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                <span className="cbfootprintunit" style={{ opacity: x.plasticWeight > 0 ? 1 : 0 }}>Plastic Weight (in {x.plasticWeight > 0 ? x.plasticWeightUnit==="Grams" || x.plasticWeightUnit==="Kilogram" || x.plasticWeightUnit==="Pound" || x.plasticWeightUnit==="Metric Tonnes" ? "Kg" : x.plasticWeightUnit : 'Grams'})</span>
                                                                            </div>
                                                                            : <div className="compare_carbfootval">
                                                                                <span className="cbfootprintval" >NA <span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                <span className="cbfootprintval" > </span>
                                                                            </div>
                                                                        :
                                                                        (this.state.orderby === 'TEprint') ?
                                                                            showproductdata.filter(x => x.transportEmission > 0).length > 0 ?
                                                                                <div className="compare_carbfootval">
                                                                                    <span className="cbfootprintval">{showproductdata.filter(y => y.productGuid == x.productGuid)[0].transportEmission ? showproductdata.filter(y => y.productGuid == x.productGuid)[0].transportEmission.toFixed(2) : "-"}<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                    <span className="cbfootprintunit" style={{ opacity: showproductdata.filter(y => y.productGuid == x.productGuid)[0].transportEmission > 0 ? 1 : 0 }}>Transport CO<sub>2</sub> (in <span className="cbfootprintunit" dangerouslySetInnerHTML={{ __html: showproductdata.filter(y => y.productGuid == x.productGuid)[0].carbonemissionunit }}></span>)</span>
                                                                                </div>
                                                                                : <div className="compare_carbfootval">
                                                                                    <span className="cbfootprintval">NA<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                    <span className="cbfootprintval"> </span>
                                                                                </div>
                                                                            :
                                                                            (this.state.orderby === 'CFprint') ?
                                                                                showproductdata.filter(x => x.carbonemissionqty > 0).length > 0 ?
                                                                                    <div className="compare_carbfootval">
                                                                                        <span className="cbfootprintval">{x.carbonemissionqty > 0 ? x.carbonemissionqty.toFixed(2) : "-"}<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                        <span className="cbfootprintunit" style={{ opacity: x.carbonemissionqty > 0 ? 1 : 0 }}>Product CO<sub>2</sub> (in <span className="cbfootprintunit" dangerouslySetInnerHTML={{ __html: showproductdata.filter(y => y.productGuid == x.productGuid)[0].carbonemissionunit }}></span>)</span>
                                                                                    </div>
                                                                                    : <div className="compare_carbfootval">
                                                                                        <span className="cbfootprintval">NA<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                        <span className="cbfootprintval" > </span>
                                                                                    </div>
                                                                                :
                                                                                (this.state.orderby === 'MOQ') ?
                                                                                    showproductdata.filter(x => x.mOQ > 0).length > 0 ?
                                                                                        x.mOQ == 0 ?
                                                                                            <div className="compare_carbfootval">
                                                                                                <span className="cbfootprintval">NA</span>
                                                                                                {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                    <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                    : <span className="cbfootprintunit">
                                                                                                        <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                    </span>
                                                                                                }
                                                                                            </div>
                                                                                            :
                                                                                            this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                !x.filterlenght ?
                                                                                                    <div className="compare_carbfootval">
                                                                                                        <span className="cbfootprintval">{x.mOQ}<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                        <span className="cbfootprintunit">MOQ (in {this.props.quantityname})</span>
                                                                                                    </div>
                                                                                                    :
                                                                                                    <div className="compare_carbfootval">
                                                                                                        <span className="cbfootprintval">NA</span>
                                                                                                        <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                    </div>
                                                                                                :
                                                                                                !x.filterlenght ?
                                                                                                    <div className="compare_carbfootval">
                                                                                                        <span className="cbfootprintval">{x.mOQ}<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                        <span className="cbfootprintunit">MOQ (in {this.props.quantityname})</span>
                                                                                                    </div>
                                                                                                    :
                                                                                                    <div className="compare_carbfootval">
                                                                                                        <span className="cbfootprintval">NA</span>
                                                                                                        <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link></span>
                                                                                                    </div>
                                                                                        : <div className="compare_carbfootval">
                                                                                            <span className="cbfootprintval">NA</span>
                                                                                            {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                : <span className="cbfootprintunit">
                                                                                                    <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                </span>
                                                                                            }
                                                                                        </div>
                                                                                    : (this.state.orderby === 'LeadTime') ?
                                                                                        showproductdata.filter(x => x.leadtimeqty > 0).length > 0 ?
                                                                                            this.state.isblank === false ?
                                                                                                x.greaterthanmoq === false ?
                                                                                                    x.filterlength === true ?
                                                                                                        x.leadtimeqty > 0 ?
                                                                                                            <div className="compare_carbfootval">
                                                                                                                <span className="cbfootprintval">{x.leadtimeqty}<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                                <span className="cbfootprintunit">Lead Time (in Days)</span>
                                                                                                            </div>
                                                                                                            :
                                                                                                            <div className="compare_carbfootval">
                                                                                                                <span className="cbfootprintval">NA<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                                {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                                    <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                                    : <span className="cbfootprintunit">
                                                                                                                        <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                                    </span>
                                                                                                                }
                                                                                                            </div> :
                                                                                                        x.leadtimeqty > 0 ?
                                                                                                            <div className="compare_carbfootval">
                                                                                                                <span className="cbfootprintval">{x.leadtimeqty}<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                                <span className="cbfootprintunit">Lead Time (in Days)</span>
                                                                                                            </div>
                                                                                                            :
                                                                                                            <div className="compare_carbfootval">
                                                                                                                <span className="cbfootprintval">NA<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                                {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                                    <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                                    : <span className="cbfootprintunit">
                                                                                                                        <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                                    </span>
                                                                                                                }
                                                                                                            </div>
                                                                                                    :
                                                                                                    x.filterlength === true ?
                                                                                                        <div className="compare_carbfootval">
                                                                                                            <span className="cbfootprintval">{x.leadtimeqty}<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                            <span className="cbfootprintunit">Lead Time (in Days)</span>
                                                                                                        </div>
                                                                                                        :
                                                                                                        <div className="compare_carbfootval">
                                                                                                            <span className="cbfootprintval">NA<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                            {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                                <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                                : <span className="cbfootprintunit">
                                                                                                                    <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                                </span>
                                                                                                            }
                                                                                                        </div>
                                                                                                :
                                                                                                x.leadtimeqty > 0 ?
                                                                                                    <div className="compare_carbfootval">
                                                                                                        <span className="cbfootprintval">{x.leadtimeqty}<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                        <span className="cbfootprintunit">Lead Time (in Days)</span>
                                                                                                    </div> :
                                                                                                    <div className="compare_carbfootval">
                                                                                                        <span className="cbfootprintval">NA<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                        {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                            <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                            : <span className="cbfootprintunit">
                                                                                                                <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                            </span>
                                                                                                        }
                                                                                                    </div>
                                                                                            : <div className="compare_carbfootval">
                                                                                                <span className="cbfootprintval">NA<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                    <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                    : <span className="cbfootprintunit">
                                                                                                        <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                    </span>
                                                                                                }
                                                                                            </div>
                                                                                        :
                                                                                        (this.state.orderby === 'MinPrice') ?
                                                                                            showproductdata.filter(x => x.priceqty > 0).length > 0 ?
                                                                                                this.state.isblank === false ?
                                                                                                    x.greaterthanmoq === false ?
                                                                                                        x.filterlength === true ?
                                                                                                            x.priceqty > 0 ?
                                                                                                                <div className="compare_carbfootval">
                                                                                                                    <span className="cbfootprintval">{x.priceqty}<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                                    <span className="cbfootprintunit">Price (in {QuantityUnit})</span>
                                                                                                                </div>
                                                                                                                :
                                                                                                                <div className="compare_carbfootval">
                                                                                                                    <span className="cbfootprintval">NA<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                                    {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                                        <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                                        : <span className="cbfootprintunit">
                                                                                                                            <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                                        </span>
                                                                                                                    }
                                                                                                                </div> :
                                                                                                            x.priceqty > 0 ?
                                                                                                                <div className="compare_carbfootval">
                                                                                                                    <span className="cbfootprintval">{x.priceqty}<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                                    <span className="cbfootprintunit">Price (in {QuantityUnit})</span>
                                                                                                                </div>
                                                                                                                :
                                                                                                                <div className="compare_carbfootval">
                                                                                                                    <span className="cbfootprintval">NA<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                                    {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                                        <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                                        : <span className="cbfootprintunit">
                                                                                                                            <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                                        </span>
                                                                                                                    }
                                                                                                                </div>
                                                                                                        :
                                                                                                        x.filterlength === true ?
                                                                                                            <div className="compare_carbfootval">
                                                                                                                <span className="cbfootprintval">{x.priceqty}<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                                <span className="cbfootprintunit">Price (in {QuantityUnit})</span>
                                                                                                            </div>
                                                                                                            :
                                                                                                            <div className="compare_carbfootval">
                                                                                                                <span className="cbfootprintval">NA<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                                {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                                    <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                                    : <span className="cbfootprintunit">
                                                                                                                        <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                                    </span>
                                                                                                                }
                                                                                                            </div>
                                                                                                    :
                                                                                                    x.priceqty > 0 ?
                                                                                                        <div className="compare_carbfootval">
                                                                                                            <span className="cbfootprintval">{x.priceqty}<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                            <span className="cbfootprintunit">Price (in {QuantityUnit})</span>
                                                                                                        </div> :
                                                                                                        <div className="compare_carbfootval">
                                                                                                            <span className="cbfootprintval">NA<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                            {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                                <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                                : <span className="cbfootprintunit">
                                                                                                                    <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                                </span>
                                                                                                            }
                                                                                                        </div>
                                                                                                : <div className="compare_carbfootval">
                                                                                                    <span className="cbfootprintval">NA<span style={{ background: x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent <= 0 ? "#73DED4" : "#4ABF5D" : "#73DED4" }} >GHG impact <br /><b>{x.GHGSavingPercent != null && x.GHGSavingPercent != undefined && x.GHGSavingPercent != "" ? x.GHGSavingPercent == 0 ? "-" : parseFloat(x.GHGSavingPercent).toFixed(2) + "%" : "-"}</b></span></span>
                                                                                                    {this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                                                        <span className="cbfootprintunit"><Link style={{ color: '#FF9E1B' }} to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link></span>
                                                                                                        : <span className="cbfootprintunit">
                                                                                                            <Link style={{ color: '#FF9E1B' }} to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ</Link>
                                                                                                        </span>
                                                                                                    }
                                                                                                </div> : ''
                                                    }
                                                    {/*//*******/}
                                                    <div className="compare_co2Emission">
                                                        <span>Total CO<sub>2</sub>e : <b>{parseFloat(x.totalEmission) > 0 ? x.totalEmission.toFixed(2) : 0} <span dangerouslySetInnerHTML={{ __html: x.carbonemissionunit }}></span></b></span>
                                                        {parseFloat(x.totalEmission) > 0 ?
                                                            <React.Fragment>
                                                                <Tooltip placement="bottom-end" title={<div className='tooltip_div_bottom_end'>
                                                                    <div className="amt_breakup_tooltip">
                                                                        {parseFloat(x.carbonemissionqty) > 0 ?
                                                                            <React.Fragment>
                                                                                <div>
                                                                                    <span>Product CO<sub>2</sub>e : </span>
                                                                                    <span>{x.carbonemissionqty.toFixed(2)} <span dangerouslySetInnerHTML={{ __html: x.carbonemissionunit }}></span></span>
                                                                                </div>
                                                                            </React.Fragment>
                                                                            : ""}
                                                                        {parseFloat(x.transportEmission) > 0 ?
                                                                            <React.Fragment>
                                                                                <div>
                                                                                    <span>Transport CO<sub>2</sub>e : </span>
                                                                                    <span>{x.transportEmission.toFixed(2)} <span dangerouslySetInnerHTML={{ __html: x.carbonemissionunit }}></span></span>
                                                                                </div>
                                                                            </React.Fragment>
                                                                            : ""}
                                                                    </div>
                                                                </div>}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                                        <g opacity="0.4">
                                                                            <path d="M8.66667 10.6667H8V8H7.33333M8 5.33333H8.00667M14 8C14 8.78793 13.8448 9.56815 13.5433 10.2961C13.2417 11.0241 12.7998 11.6855 12.2426 12.2426C11.6855 12.7998 11.0241 13.2417 10.2961 13.5433C9.56815 13.8448 8.78793 14 8 14C7.21207 14 6.43185 13.8448 5.7039 13.5433C4.97595 13.2417 4.31451 12.7998 3.75736 12.2426C3.20021 11.6855 2.75825 11.0241 2.45672 10.2961C2.15519 9.56815 2 8.78793 2 8C2 6.4087 2.63214 4.88258 3.75736 3.75736C4.88258 2.63214 6.4087 2 8 2C9.5913 2 11.1174 2.63214 12.2426 3.75736C13.3679 4.88258 14 6.4087 14 8Z" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
                                                                        </g>
                                                                    </svg>
                                                                </Tooltip>
                                                            </React.Fragment>
                                                            : ""}
                                                    </div>
                                                </div>
                                            </th>)


                                    ) : ''}
                                {dropdown}
                            </tr>
                        </thead>
                        {showproductdata.length > 0 ?
                            <tbody>

                                <tr>
                                    <td>Product Image</td>

                                    {showproductdata.length > 0 ? showproductdata.map(x =>
                                        x.productGuid === this.props.ProductGuid ?
                                            <td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd prodimgcmprcont" : "prodimgcmprcont"}>
                                                <div>
                                                    <img onClick={() => this.handleClickOpen(awsUrl + "ProductImages/" + x.supplierGuid.toUpperCase() + "/Medium/" + x.imageName)} style={{ height: 70, width: 70, borderRadius: 5, top: 402, left: 940 }}
                                                        alt=" " src={awsUrl + "ProductImages/" + x.supplierGuid.toUpperCase() + "/Medium/" + x.imageName}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = awsUrl + "ProductImages/Thumbnail/default.jpg" }} />
                                                    <Dialog
                                                        onClose={this.handleClose}
                                                        aria-labelledby="customized-dialog-title"
                                                        maxWidth="lg"
                                                        open={this.state.open}
                                                        PaperProps={{
                                                            className: 'compare_img_modal'
                                                        }}
                                                    >
                                                        <IconButton aria-label="Close" className="cmprclosebtn" onClick={this.handleClose}>
                                                            <CloseIcon />
                                                        </IconButton>
                                                        <DialogContent>
                                                            <img style={{ height: 500, width: 500 }}
                                                                alt="" src={this.state.popupimage}
                                                                onError={(e) => { e.target.onerror = null; e.target.src = awsUrl + "ProductImages/Thumbnail/default.jpg" }}
                                                            />
                                                        </DialogContent>

                                                    </Dialog>
                                                </div>
                                            </td> :
                                            <td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd prodimgcmprcont" : "prodimgcmprcont"}>
                                                <div>
                                                    <img onClick={() => this.handleClickOpen(awsUrl + "ProductImages/" + x.supplierGuid.toUpperCase() + "/Medium/" + x.imageName)} style={{ height: 70, width: 70, borderRadius: 5, top: 402, left: 940 }}
                                                        alt=" " src={awsUrl + "ProductImages/" + x.supplierGuid.toUpperCase() + "/Medium/" + x.imageName}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = awsUrl + "ProductImages/Thumbnail/default.jpg" }} />
                                                    <Dialog
                                                        onClose={this.handleClose}
                                                        aria-labelledby="customized-dialog-title"
                                                        maxWidth="lg"
                                                        open={this.state.open}
                                                        PaperProps={{
                                                            className: 'compare_img_modal'
                                                        }}
                                                    >
                                                        <IconButton aria-label="Close" className="cmprclosebtn" onClick={this.handleClose}>
                                                            <CloseIcon />
                                                        </IconButton>
                                                        <DialogContent>
                                                            <img style={{ height: 500, width: 500 }}
                                                                alt="" src={this.state.popupimage}
                                                                onError={(e) => { e.target.onerror = null; e.target.src = awsUrl + "ProductImages/Thumbnail/default.jpg" }}
                                                            />
                                                        </DialogContent>

                                                    </Dialog>
                                                </div>
                                            </td>
                                    ) : ''}
                                </tr>
                                {(this.state.orderby === 'MinPrice') ? '' : this.getCompareProductData("Price", this.state.isblank ? this.props.ProductPrice === 0 ?
                                    this.props.rfqProductDetails.filter(xitems => xitems.productguid == this.props.ProductGuid).length > 0 ? "-" :
                                        <Link to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link> :
                                    Number(Math.round(this.props.ProductPrice + "e2") + "e-2").toFixed(this.props.DecimalPrecision) :
                                    this.state.priceqty > 0 ? this.state.priceqty :
                                        this.props.rfqProductDetails.filter(xitems => xitems.productguid == this.props.ProductGuid).length > 0 ? "-" :
                                            <Link to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link>,
                                    showproductdata, 'minPrice', dropdownBottomTD, this.props.CurrencySymbol, "", [], false)}
                                <tr>
                                    <td>Carbon Adjusted Price</td>
                                    {showproductdata.length > 0 ? showproductdata.map(x =>
                                        <td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>
                                            {!x.filterlenght ?
                                                x.CarbonAdjustedPrice != null && x.CarbonAdjustedPrice != undefined && x.CarbonAdjustedPrice != "" ?
                                                    x.CarbonAdjustedPrice == 0 ? "-" : parseFloat(x.CarbonAdjustedPrice).toFixed(2) + " " + this.props.CurrencySymbol + "/" + this.props.quantityname :
                                                    "-" : "-"}
                                        </td>
                                    ) : ''}
                                    {dropdownBottomTD}
                                </tr>
                                <tr>
                                    <td>Total GHG impact</td>
                                    {showproductdata.length > 0 ? showproductdata.map(x =>
                                        <td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>
                                            {x.GHGSaving != null && x.GHGSaving != undefined && x.GHGSaving != "" ?
                                                x.GHGSaving == 0 ? "-" : <React.Fragment>{parseFloat(x.GHGSaving).toFixed(2)} <span dangerouslySetInnerHTML={{ __html: x.carbonemissionunit }}></span></React.Fragment>
                                                :
                                                "-"
                                            }
                                        </td>
                                    ) : ''}
                                    {dropdownBottomTD}
                                </tr>
                                <tr className={this.state.orderby === 'Environment' || this.state.orderby === 'Social' || this.state.orderby === 'Governance' ? 'inneresgtbl_cont rmveonescore' : 'inneresgtbl_cont'} >
                                    <td colspan={colspan}>
                                        <table>
                                            <tbody>
                                                {(this.state.orderby === 'Environment') ? '' :
                                                    <tr className="leftpaddtr">
                                                        <td>Environment</td>
                                                        {/* <td>{this.props.supplierLocation != null && this.props.supplierLocation != "" && this.props.supplierLocation != undefined ? this.props.supplierLocation : "-"}</td> */}
                                                        {showproductdata.length > 0 ? showproductdata.map(x =>
                                                            highestescore.filter(z => z === x.productGuid).length > 0 ?
                                                                <td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>
                                                                    {x.eScore != null && x.eScore != "" && x.eScore != undefined && x.eScore != 0 ? <b style={{ background: "#73DED4" }}>{x.eScore.toFixed(2) + "%"}</b> : "-"}
                                                                </td>
                                                                :
                                                                <td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>
                                                                    {x.eScore != null && x.eScore != "" && x.eScore != undefined && x.eScore != 0 ? x.eScore.toFixed(2) + "%" : "-"}
                                                                </td>

                                                        ) : ''}
                                                        {dropdownBottomTD}

                                                    </tr>
                                                }
                                                {(this.state.orderby === 'Social') ? '' :
                                                    <tr className={this.state.orderby === 'Environment' ? "leftpaddtr escoreleftpaddtr" : "leftpaddtr"}>
                                                        <td>Social</td>
                                                        {/* <td>{this.props.supplierLocation != null && this.props.supplierLocation != "" && this.props.supplierLocation != undefined ? this.props.supplierLocation : "-"}</td> */}
                                                        {showproductdata.length > 0 ? showproductdata.map(x =>
                                                            highestsscore.filter(z => z === x.productGuid).length > 0 ?
                                                                <td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>
                                                                    {x.sScore != null && x.sScore != "" && x.sScore != undefined && x.sScore != 0 ? <b style={{ background: "#73DED4" }}>{x.sScore.toFixed(2) + "%"}</b> : "-"}
                                                                </td>
                                                                :
                                                                <td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>
                                                                    {x.sScore != null && x.sScore != "" && x.sScore != undefined && x.sScore != 0 ? x.sScore.toFixed(2) + "%" : "-"}
                                                                </td>
                                                        ) : ''}
                                                        {dropdownBottomTD}
                                                    </tr>
                                                }
                                                {(this.state.orderby === 'Governance') ? '' :
                                                    <tr className={this.state.orderby === 'Environment' ? "leftpaddtr escoreleftpaddtr" : "leftpaddtr"}>
                                                        <td>Governance</td>
                                                        {/* <td>{this.props.supplierLocation != null && this.props.supplierLocation != "" && this.props.supplierLocation != undefined ? this.props.supplierLocation : "-"}</td> */}
                                                        {showproductdata.length > 0 ? showproductdata.map(x =>
                                                            highestgscore.filter(z => z === x.productGuid).length > 0 ?
                                                                <td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>
                                                                    {x.gScore != null && x.gScore != "" && x.gScore != undefined && x.gScore != 0 ? <b style={{ background: "#73DED4" }}>{x.gScore.toFixed(2) + "%"}</b> : "-"}
                                                                </td>
                                                                :
                                                                <td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>
                                                                    {x.gScore != null && x.gScore != "" && x.gScore != undefined && x.gScore != 0 ? x.gScore.toFixed(2) + "%" : "-"}
                                                                </td>
                                                        ) : ''}
                                                        {dropdownBottomTD}
                                                    </tr>
                                                }
                                                <tr className="vendesgscrorecont">
                                                    <td>ESG Score</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                                {(this.state.orderby === 'pWeight') ? '' : this.getCompareProductData('Plastic Weight',
                                    showproductdata.filter(a => a.productGuid == this.props.ProductGuid).length > 0 ? showproductdata.filter(a => a.productGuid == this.props.ProductGuid)[0].listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSKUGuid).length > 0 ? showproductdata.filter(a => a.productGuid == this.props.ProductGuid)[0].listProductVariantsVM.filter(x => x.skuGuid == this.props.SelectedSKUGuid)[0].plasticWeight : 0 : 0,
                                    showproductdata, 'plasticWeight', dropdownBottomTD, "", "", [], false)}
                                {(this.state.orderby === 'MOQ') ? '' :
                                    this.getCompareProductData('MOQ (In ' + this.props.quantityname + ')',
                                        this.state.productqty < this.props.MOQ ? this.props.rfqProductDetails.filter(xitems => xitems.productguid == this.props.ProductGuid).length > 0 ?
                                            "-" : <Link to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link> : this.props.MOQ == 0 ?
                                            this.props.rfqProductDetails.filter(xitems => xitems.productguid == this.props.ProductGuid).length > 0 ? "-" :
                                                <Link to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link> :
                                            this.props.MOQ, showproductdata, 'mOQ', dropdownBottomTD, "", "", [], true)}

                                <tr>
                                    <td>Suppier Location</td>
                                    {/* <td>{this.props.supplierLocation != null && this.props.supplierLocation != "" && this.props.supplierLocation != undefined ? this.props.supplierLocation : "-"}</td> */}
                                    {showproductdata.length > 0 ? showproductdata.map(x =>
                                        x.productGuid === this.props.ProductGuid ?
                                            <td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>
                                                {x.supplierLocation != null && x.supplierLocation != "" && x.supplierLocation != undefined ? x.supplierLocation : "-"}
                                            </td>
                                            :
                                            <td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>
                                                {x.supplierLocation != null && x.supplierLocation != "" && x.supplierLocation != undefined ? x.supplierLocation : "-"}
                                            </td>
                                    ) : ''}
                                    {dropdownBottomTD}
                                </tr>
                                {(this.state.orderby === 'LeadTime') ? '' : <tr>
                                    <td>Lead Time (In Days)</td>
                                    {/* <td className="selected_comparetd">{this.state.isblank ? this.props.MinLeadTime === 0 ? this.props.rfqProductDetails.filter(xitems => xitems.productguid == this.props.ProductGuid).length > 0 ? "-" : <Link to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link> : this.props.MinLeadTime : this.state.leadtimeqty > 0 ? this.state.leadtimeqty : this.props.rfqProductDetails.filter(xitems => xitems.productguid == this.props.ProductGuid).length > 0 ? "-" : <Link to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link>}</td> */}
                                    {showproductdata.length > 0 ? showproductdata.map((x) => (
                                        x.productGuid === this.props.ProductGuid ?
                                            lowestLeadTime.filter(z => z === x.productGuid).length > 0 ?
                                                <td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>
                                                    {this.state.isblank ? x.leadtimeqty === 0 ?
                                                        this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                            <Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link>
                                                            :
                                                            <Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ </Link> :
                                                        <b style={{ background: "#73DED4" }}>{x.leadtimeqty}</b> : x.greaterthanmoq === false ?
                                                        x.leadtimeqty > 0 ? <b style={{ background: "#73DED4" }}>{x.leadtimeqty}</b>
                                                            :
                                                            this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                <Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link>
                                                                :
                                                                <Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ </Link>
                                                        : x.filterlength === false ?
                                                            this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                <Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link>
                                                                :
                                                                <Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ </Link>
                                                            :
                                                            this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                <Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link>
                                                                :
                                                                <Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ </Link>
                                                    }</td>
                                                :
                                                <td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>
                                                    {this.state.isblank ? x.leadtimeqty === 0 ?
                                                        this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                            <Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link>
                                                            :
                                                            <Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ </Link> :
                                                        x.leadtimeqty : x.greaterthanmoq === false ?
                                                        x.leadtimeqty > 0 ? x.leadtimeqty
                                                            :
                                                            this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                <Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link>
                                                                :
                                                                <Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ </Link>
                                                        : x.filterlength === false ?
                                                            this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                <Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link>
                                                                :
                                                                <Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ </Link>
                                                            :
                                                            this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                                <Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link>
                                                                :
                                                                <Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ </Link>
                                                    }</td>
                                            :
                                            lowestLeadTime.filter(z => z === x.productGuid).length > 0 ?
                                                <td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>{this.state.isblank ? x.leadtimeqty === 0 ?
                                                    this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                        <Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link>
                                                        :
                                                        <Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}> View RFQ</Link> :
                                                    <b style={{ background: "#73DED4" }}>{x.leadtimeqty}</b> : x.greaterthanmoq === false ?
                                                    x.leadtimeqty > 0 ? <b style={{ background: "#73DED4" }}>{x.leadtimeqty}</b>
                                                        :
                                                        this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                            <Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link>
                                                            :
                                                            <Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ </Link>
                                                    : x.filterlength === false ?
                                                        this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                            <Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link>
                                                            :
                                                            <Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ </Link>
                                                        :
                                                        this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                            <Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link>
                                                            :
                                                            <Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ </Link>
                                                }
                                                </td> :
                                                <td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>{this.state.isblank ? x.leadtimeqty === 0 ?
                                                    this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                        <Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link>
                                                        :
                                                        <Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}> View RFQ</Link> :
                                                    x.leadtimeqty : x.greaterthanmoq === false ?
                                                    x.leadtimeqty > 0 ? x.leadtimeqty
                                                        :
                                                        this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                            <Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link>
                                                            :
                                                            <Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ </Link>
                                                    : x.filterlength === false ?
                                                        this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                            <Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link>
                                                            :
                                                            <Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ </Link>
                                                        :
                                                        this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                                            <Link to={"/create-rfq?productguid=" + x.productGuid + ""}>Contact Supplier</Link>
                                                            :
                                                            <Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>View RFQ </Link>
                                                }
                                                </td>)) : ''}
                                    {dropdownBottomTD}
                                </tr>}
                                {this.getCompareProductData('Material', MaterialList, showproductdata, 'productmaterial.raw', dropdownBottomTD, "", "", [], false)}
                                {(this.state.orderby === 'CFprint') ? '' :
                                
                                    //this.getCompareProductData('Carbon Footprint',
                                    //    this.state.isblank ? this.props.CarbonEmission === 0 ?
                                    //this.props.rfqProductDetails.filter(xitems => xitems.productguid == this.props.ProductGuid).length > 0 ? "-" :
                                    //        <Link to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link> : this.props.CarbonEmission :
                                    //    this.state.CarbonEmission < this.props.CarbonEmission ? this.props.rfqProductDetails.filter(xitems => xitems.productguid == this.props.ProductGuid).length > 0
                                    //        ? "-" : <Link to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link> : this.props.CarbonEmission == 0 ?
                                    //        this.props.rfqProductDetails.filter(xitems => xitems.productguid == this.props.ProductGuid).length > 0 ? "-" :
                                    //            <Link to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>Contact Supplier</Link> :
                                    //        this.props.CarbonEmission, showproductdata, 'carbonEmission', dropdownBottomTD, this.props.carbonEmissionUnit, "", [], true)}

                                    this.getCompareProductData('Product CO<sub>2</sub>e', this.props.CarbonEmission === 0 ? "-" : this.props.CarbonEmission + ' ' + this.props.carbonEmissionUnit, (showproductdata.length > 0 ? showproductdata : []), 'carbonEmission', dropdownBottomTD, "", this.props.carbonEmissionUnit, (showproductdata.length > 0 ? showproductdata[0].listRateCardVM : []))}

                                {(this.state.orderby === 'TEprint') ? '' :
                                    this.getCompareProductData('Transport CO<sub>2</sub>e', showproductdata.length > 0 ? showproductdata.length > 0 ? showproductdata.filter(x => x.productGuid == this.props.ProductGuid)[0].transportEmission : "-" : "-", showproductdata, 'transportEmission', dropdownBottomTD, "", showproductdata.length > 0 ? showproductdata.length > 0 ? showproductdata.filter(x => x.productGuid == this.props.ProductGuid)[0].transportEmissionUnit : "" : "", [], false)}

                                {this.getCompareProductData('Green Properties/Claims', this.state.selectedProductGreenProperties, showproductdata, 'productGreenProperties', dropdownBottomTD, "", "", [], true)}
                                {this.getCompareProductData('Certifications', this.state.selectedProductCertifications, showproductdata, 'productCertifications', dropdownBottomTD, "", "", [], true)}
                                <tr>
                                    <td>Product Description</td>
                                    {/* <td>
                                        <div className="compareDec" dangerouslySetInnerHTML={{ __html: this.props.Description }}></div>
                                    </td> */}
                                    {showproductdata.length > 0 ? showproductdata.map(x =>
                                        x.productGuid === this.props.ProductGuid ?
                                            <td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>
                                                <div className="compareDec viewMore" dangerouslySetInnerHTML={{ __html: x.description }}></div>
                                            </td>
                                            :
                                            <td className={lowestCarbonEmission.filter(z => z == x.productGuid).length > 0 ? "selected_comparetd" : ""}>
                                                <div className="compareDec" dangerouslySetInnerHTML={{ __html: x.description }}></div>
                                            </td>
                                    ) : ''}
                                    {dropdownBottomTD}
                                </tr>
                                {/*{this.state.savingsDataArray.length > 0 ?*/}
                                {/*    <tr>*/}
                                {/*        <td>Savings/Unit </td>*/}
                                {/*        <td>{this.props.SavingErrorMsg === '' ? this.props.SavingsPerUnit : this.props.SavingErrorMsg}</td>*/}
                                {/*        {showproductdata.length > 0 ? showproductdata.map(x =>*/}
                                {/*            <td>*/}
                                {/*                {this.state.savingsDataArray.filter(y => y.productGuid === x.productGuid)[0].ErrMsg === "" ? this.state.savingsDataArray.filter(y => y.productGuid === x.productGuid)[0].savingsPerUnit :*/}
                                {/*                    this.state.savingsDataArray.filter(y => y.productGuid === x.productGuid)[0].ErrMsg}*/}
                                {/*            </td>*/}
                                {/*        ) : ''}*/}
                                {/*        {dropdownBottomTD}*/}
                                {/*    </tr> : ""}*/}
                                {/*{this.state.savingsDataArray.length > 0 ?*/}
                                {/*    <tr>*/}
                                {/*        <td>Total Savings</td>*/}
                                {/*        <td>{this.props.SavingErrorMsg === '' ? this.props.TotalSavings : this.props.SavingErrorMsg}</td>*/}
                                {/*        {showproductdata.length > 0 ? showproductdata.map(x =>*/}
                                {/*            <td>*/}
                                {/*                {this.state.savingsDataArray.filter(y => y.productGuid === x.productGuid)[0].ErrMsg === "" ? this.state.savingsDataArray.filter(y => y.productGuid === x.productGuid)[0].savings :*/}
                                {/*                    this.state.savingsDataArray.filter(y => y.productGuid === x.productGuid)[0].ErrMsg}*/}
                                {/*            </td>*/}
                                {/*        ) : ''}*/}
                                {/*        {dropdownBottomTD}*/}
                                {/*    </tr> : ""}*/}
                                {/*{this.getCompareProductData('Supplier', this.props.CompanyName, showproductdata, 'companyName', dropdownBottomTD, "", "", [])}*/}
                                {/*{this.getCompareProductData('Brand', this.props.Brand, showproductdata, 'productbrand.raw', dropdownBottomTD, "", "", [])}*/}

                                {/*{(this.props.Length == null || this.props.Length == undefined || this.props.DimensionUnit === null || this.props.DimensionUnit === undefined) && showproductdata.length > 0 &&*/}
                                {/*    (showproductdata.map(x => x.length === null || x.length === undefined)) ? '' :*/}
                                {/*    <tr>*/}
                                {/*        <td>Length</td>*/}
                                {/*        <td>{this.props.Length} {this.props.DimensionUnit}</td>*/}
                                {/*        {showproductdata.length > 0 ? showproductdata.map(x =>*/}
                                {/*            <td>{x.length === null || x.length === undefined ? "-" : x.length}*/}
                                {/*                {x.length === null || x.length === undefined ? " " : x.dimensionUnit}</td>*/}
                                {/*        ) : ''}*/}
                                {/*        {dropdownBottomTD}*/}
                                {/*    </tr>}*/}
                                {/*{(this.props.Width == null || this.props.Width == undefined || this.props.DimensionUnit === null || this.props.DimensionUnit === undefined) && showproductdata.length > 0 &&*/}
                                {/*    (showproductdata.map(x => x.width === null || x.width === undefined)) ? '' :*/}
                                {/*    <tr>*/}
                                {/*        <td>Width</td>*/}
                                {/*        <td>{this.props.Width} {this.props.DimensionUnit}</td>*/}
                                {/*        {showproductdata.length > 0 ? showproductdata.map(x =>*/}
                                {/*            <td>{x.width === null || x.width === undefined ? "-" : x.width}*/}
                                {/*                {x.width === null || x.width === undefined ? " " : x.dimensionUnit}</td>*/}
                                {/*        ) : ''}*/}
                                {/*        {dropdownBottomTD}*/}
                                {/*    </tr>}*/}
                                {/*{(this.props.Height == null || this.props.Height == undefined || this.props.DimensionUnit === null || this.props.DimensionUnit === undefined) && showproductdata.length > 0 &&*/}
                                {/*    (showproductdata.map(x => x.height === null || x.height === undefined)) ? '' :*/}
                                {/*    <tr>*/}
                                {/*        <td>Height</td>*/}
                                {/*        <td>{this.props.Height} {this.props.DimensionUnit}</td>*/}
                                {/*        {showproductdata.length > 0 ? showproductdata.map(x =>*/}
                                {/*            <td>{x.height === null || x.height === undefined ? "-" : x.height}*/}
                                {/*                {x.height === null || x.height === undefined ? " " : x.dimensionUnit}</td>*/}
                                {/*        ) : ''}*/}
                                {/*        {dropdownBottomTD}*/}
                                {/*    </tr>}*/}
                                {/*{(this.props.Volume == '' || this.props.Volume == null || this.props.Volume == undefined || this.props.VolumeUnit === null || this.props.VolumeUnit === undefined) && showproductdata.length > 0 &&*/}
                                {/*    (showproductdata.map(x => x.volume === '' || x.volume === null || x.volume === undefined)) ? '' :*/}
                                {/*    <tr>*/}
                                {/*        <td>Volume</td>*/}
                                {/*        <td>{this.props.Volume} {this.props.VolumeUnit}</td>*/}
                                {/*        {showproductdata.length > 0 ? showproductdata.map(x =>*/}
                                {/*            <td>{x.volume === '' || x.volume === null || x.volume === undefined ? "-" : x.volume}*/}
                                {/*                {x.volume === '' || x.volume === null || x.volume === undefined ? " " : x.volumeUnit}</td>*/}
                                {/*        ) : ''}*/}
                                {/*        {dropdownBottomTD}*/}
                                {/*    </tr>}*/}
                                {/*{(this.props.Weight == '' || this.props.Weight == null || this.props.Weight == undefined || this.props.WeightUnit === null || this.props.WeightUnit === undefined) && showproductdata.length > 0 &&*/}
                                {/*    (showproductdata.map(x => x.weight === null || x.weight === undefined)) ? '' :*/}
                                {/*    <tr>*/}
                                {/*        <td>Weight</td>*/}
                                {/*        <td>{this.props.Weight} {this.props.WeightUnit}</td>*/}
                                {/*        {showproductdata.length > 0 ? showproductdata.map(x =>*/}
                                {/*            <td>{x.weight === '' || x.weight === null || x.weight === undefined ? "-" : x.weight}*/}
                                {/*                {x.weight === '' || x.weight === null || x.weight === undefined ? " " : x.weightUnit}</td>*/}
                                {/*        ) : ''}*/}
                                {/*        {dropdownBottomTD}*/}
                                {/*    </tr>}*/}
                                {/*{localStorage.showGradeLevel === true ?*/}
                                {/*    <tr>*/}
                                {/*        <td>Grade Level</td>*/}
                                {/*        <td>{this.state.selectedProductGrade}</td>*/}
                                {/*        {showproductdata.length > 0 ? showproductdata.map(x =>*/}
                                {/*            <td>*/}
                                {/*                {x.gradeLevel}*/}
                                {/*            </td>*/}
                                {/*        ) : ''}*/}
                                {/*        {dropdownBottomTD}*/}
                                {/*    </tr> : ''}*/}
                                {/*{this.getCompareProductData('Supplier Accreditations', this.state.selectedProductAccreditations, showproductdata, 'listsupplieraccreditation.raw', dropdownBottomTD, "", "", [])}*/}
                                {/*{this.getCompareProductData('Carbon FootPrint', this.props.CarbonEmission + ' ' + this.props.carbonEmissionUnit, (showproductdata.length > 0 ? showproductdata[0].listProductVariantsVM : []), 'carbonEmission', dropdownBottomTD, "", this.props.carbonEmissionUnit, (showproductdata.length > 0 ? showproductdata[0].listRateCardVM : []))}*/}
                                {/*{this.getCompareProductData('Carbon Cost', this.props.Currency + ' ' + parseFloat(this.props.carbonCost).toFixed(decimalValue).toString() + (this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? ' Per ' + this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] : ""), showproductdata, 'carbonCost', dropdownBottomTD, this.props.Currency, (this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? 'Per ' + this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] : ""))}*/}
                                {/*{this.getCompareProductData('Carbon Adjusted Cost', this.props.Currency + ' ' + parseFloat(this.props.carbonAdjustedCost).toFixed(decimalValue) + (this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? ' Per ' + this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] : "").toString(), showproductdata, 'carbonAdjustedCost', dropdownBottomTD, this.props.Currency, (this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid).length > 0 ? 'Per ' + this.props.unitList.filter(x => x.unitGuid === this.props.QuantityUnitGuid)[0]['name'] : ""))}*/}
                                <tr className="comprpopnobgtd">
                                    <td></td>
                                    {/* {this.props.rfqProductDetails.filter(xitems => xitems.productguid == this.props.ProductGuid).length == 0 ?
                                        <td className="selected_comparetd">
                                            <div className="product_details_right_container_action_btn">
                                                <Link to={"/create-rfq?productguid=" + this.props.ProductGuid + ""}>
                                                    <Button className="primaryBtn">Request For Quote</Button>
                                                </Link>
                                            </div>
                                        </td> : <td className="selected_comparetd">
                                            <div className="product_details_right_container_action_btn">
                                                <Link to={"/rfqlisting?rfqguid=" + this.props.productrfqguid + ""}>
                                                    <Button className="primaryBtn">View RFQ</Button>
                                                </Link>
                                            </div>
                                        </td>} */}
                                    {showproductdata.length > 0 ? showproductdata.map(x =>
                                        this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid).length == 0 ?
                                            <td>
                                                <div className="product_details_right_container_action_btn">
                                                    <Link to={"/create-rfq?productguid=" + x.productGuid + ""}>
                                                        <Button className="solid_btn_new">Request For Quote</Button>
                                                    </Link>
                                                </div>
                                            </td> : <td>
                                                <div className="product_details_right_container_action_btn">
                                                    <Link to={"/rfqlisting?rfqguid=" + this.props.rfqProductDetails.filter(xitems => xitems.productguid == x.productGuid)[0].rfqguid + ""}>
                                                        <Button className="solid_btn_new">View RFQ</Button>
                                                    </Link>
                                                </div>
                                            </td>
                                    ) : ''}
                                    {dropdownBottomTD}
                                </tr>

                                <tr className="comprpopnobgtd cmprviewbtncont">
                                    <td></td>

                                    {/* <td className="selected_comparetd">
                                        <div className="product_details_right_container_action_btn">
                                            <Link to={"/product-details?product=" + this.props.ProductGuid + ""}>
                                                <Button className="primaryBtn tertiaryBtn">View Details</Button>
                                            </Link>
                                        </div>
                                    </td> */}
                                    {showproductdata.length > 0 ? showproductdata.map(x =>
                                        <td>
                                            <div className="product_details_right_container_action_btn">
                                                <Link to={"/product-details?product=" + x.productGuid + ""}>
                                                    <Button className="solid_btn_new">View Details</Button>
                                                </Link>
                                            </div>
                                        </td>
                                    ) : ''}
                                    {dropdownBottomTD}
                                </tr>
                            </tbody> : ''}
                    </table>
                    {
                        dropdownoption.filter(t => t.productGuid == this.state.currentProductGuid).length > 0 ?
                            <Popover
                                id={'compare_popper'}
                                className="compare_popper"
                                open={open}
                                anchorEl={anchorEl}
                                onClose={this.handleCloseComparePopover}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                {dropdownoption.filter(t => t.productGuid == this.state.currentProductGuid).map(items => {
                                    return (items.dropdown)
                                })}

                            </Popover> 
                            : ""
                    }
                </div >
            )
        } else {
            return "";
        }
    }
}
export default withStyles(styles)(CompareProduct)