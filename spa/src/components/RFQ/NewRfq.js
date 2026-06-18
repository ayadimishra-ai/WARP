import React, { Component } from "react";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import { Link } from "react-router-dom";
import { getPageResource, getElasticData } from '../../utility';
import { getServiceUrl, getWebsiteGUID, getWebsiteLanguageGuid, getLanguageResourceElasticIndex, getLabelText, getUrlParameter, getElasticIndexNew } from "../../config";
import CustomSearchMultiSelectDropdown_new from '../SupplierOnBoarding/CustomSearchMultiSelectdropdown_new';
import axios from "axios";
import Spinner from '../../UI/Spinner/Spinner';

let responsedata = null;
const initialState = {
    NewRfq: {
        Title: {
            elementType: "input_2",
            class: "newInput_2",
            newThemeError: "Title is required",
            elementConfig: { placeholder: '' },
            value: "",
            validation: {
                // required: true,
                required: true,
                alphaNumericOnlySpace: true,
                maxLength: 50,
            },
            requiredclass: "required",
            label: "RFQ Title For e.g. June 2021 Production",
            valid: false,
            touched: true
        }
    }
}

class NewRfq extends Component {
    constructor(props) {
        super(props)
        this.state = {
            rfqLanguageResources: [],
            ...initialState,
            showError: false,
            showProducttypeError: false,
            ProductTypedetails: [],
            showProductType: true,
            isArtworkApplicable: false,
            SelectedProductType: "",
            SelectedProductTypeName: "",
            unitGuid: '',
            companyGuid: '',
            ProductGuid: '00000000-0000-0000-0000-000000000000',
            SelectedCategoryName: "",
            productName: '',
            companyName: '',
            supplier_city: '',
            supplier_state: '',
            isCatelogRFQ: false,
            isExactSupplier: false,
            exactProductDetail: null,
            defaultAddressGuid: null,
            buyerDefaultAddressGuid: null
        }
    }


    // componentDidUpdate(){
    //     if (this.props.rfqTitle !== undefined) {
    //         const updatedNewRfqInfo = {
    //             ...this.state.NewRfq
    //         };
    //         let updatedFormElement = {
    //             ...updatedNewRfqInfo["Title"]
    //         };
    //         if(updatedFormElement.value === ""){
    //             updatedFormElement.value = this.props.rfqTitle;
    //             this.setState({ NewRfq: updatedNewRfqInfo });
    //         }
    //     }
    // }

    async componentDidMount() {
        this.getRFQLanguageResource();
        let params = getUrlParameter("productguid");
        if (params && params != null) {
            this.setState({
                showProductType: false
            })
        }
        if (this.props.NewRfqStepData !== undefined && this.props.NewRfqStepData !== null) {
            const updatedNewRfqInfo = {
                ...this.state.NewRfq
            };
            let updatedFormElement = {
                ...updatedNewRfqInfo["Title"]
            };
            updatedFormElement.value = this.props.NewRfqStepData.rfqTitle;
            updatedNewRfqInfo["Title"] = this.checkValidity(updatedFormElement);
            this.setState({ NewRfq: updatedNewRfqInfo, ProductTypedetails: this.props.NewRfqStepData.ProductTypedetails });
        }
        await this.getUnitList();
        await this.loadData();
    }
    getUnitList = () => {
        let siteGUID = getWebsiteGUID();
        let index = siteGUID + "_unitmaster"
        getElasticData(index, '', 0, 500, '').then(result => {
            if (result !== null && result !== undefined) {
                let unitData = [...new Set(result.hits.hits.map(x => x._source))];
                this.setState({ unitList: unitData });
            }
        });
    }
    loadData = async () => {
        this.setState({ loading: true });
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
                this.setState({ ProductTypedetails: response.data.productTypeDetails, loading: false, buyerDefaultAddressGuid: response.data.BuyerDefaultAddressGuid });
                responsedata = response.data.productTypeDetails;
                let params = getUrlParameter("productguid");
                if (params && params != null) {
                    config = {
                        headers: {
                            Authorization: "Bearer " + localStorage.tokenId,
                            "Content-Type": "application/json",
                            productguid: params,
                            UserGuid: localStorage.userId
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
                            let categoryImage = responsedata.filter(x => x.categoryGuid === secondresponse.data.table1[0].productClassificationGuid).map(item => (item.categoryImage))
                            let ProductTypedata = [{
                                categoryGuid: secondresponse.data.table1[0].productTypeGuid,
                                categoryName: secondresponse.data.table1[0].productTypeName
                            }]

                            var SelectedCatdata = {
                                categoryName: secondresponse.data.table1[0].productTypeName,
                                categoryGuid: secondresponse.data.table1[0].productTypeGuid,
                                isArtworkApplicable: isArtworkApplicable !== undefined ? isArtworkApplicable.length > 0 ? isArtworkApplicable[0] : false : false,
                                categoryImage: categoryImage !== undefined ? categoryImage.length > 0 ? categoryImage[0] : null : null
                            };

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
                                isArtworkApplicable: isArtworkApplicable !== undefined ? isArtworkApplicable.length > 0 ? isArtworkApplicable[0] : false : false,
                                selectedCategories: SelectedCatdata,
                                productName: secondresponse.data.table1[0].productName,
                                companyName: secondresponse.data.table1[0].companyName,
                                supplier_city: secondresponse.data.table1[0].city,
                                supplier_state: secondresponse.data.table1[0].stateName,
                                isCatelogRFQ: true,
                                isExactSupplier: localStorage.companyGuid === secondresponse.data.table1[0].companyGuid ? true : false,
                                defaultAddressGuid: secondresponse.data.table1[0].addressguid,
                                buyerDefaultAddressGuid: secondresponse.data.table1[0].buyerDefaultAddressGuid,
                            });
                        }).catch((err) => { console.log(err) });
                }
                this.getAllProductDetail(params);
            });

    }
    getAllProductDetail = (productId) => {
        let roleName = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
        let url = getElasticIndexNew(roleName, localStorage.userId, localStorage.languageId, localStorage.companyGuid.toLocaleLowerCase());

        let splitURL = url.replace("https://", "").replace("http://").split("/");
        let urlNew = "";
        let index = "";
        let search = "";
        let commonquery = "";

        if (splitURL.length === 3) {
            urlNew = splitURL[0];
            index = splitURL[1];
            search = splitURL[2];
        } else {
            for (let i = 0; i < splitURL.length; i++) {
                if (i === 0) {
                    urlNew = splitURL[i];
                }

                if (i === 1) {
                    index = splitURL[i];
                }
                if (i === (splitURL.length - 1)) {
                    search = splitURL[i];
                }
            }
        }

        if (search.indexOf('q=') > -1) {
            let splitdata = search.replace("_search", "").replace("?", "").replace("&", "");
            if (splitdata.indexOf("q=") > -1) {
                splitdata = splitdata.split("q=");
                let datakey = [];
                let datavalue = [];
                commonquery = '"query": {"bool": {"filter": [';

                for (let j = 0; j < splitdata.length; j++) {
                    if (splitdata[j].indexOf(":") > -1) {
                        let data = splitdata[j].split(":");
                        commonquery = commonquery + '{"match": {"' + data[0] + '": "' + data[1] + '"}}';
                    }
                }
                commonquery = commonquery + '{"match": {"productname_raw.raw": "A6 6 pages leaflet Z fold"}}';
                commonquery = commonquery + ']}}';
            }
        } else {
            commonquery = '"query": {"bool": {"filter": [';
            commonquery = commonquery + '{"match": {"productname_raw.raw": "A6 6 pages leaflet Z fold"}}';
            commonquery = commonquery + ']}}';
        }

        commonquery = JSON.stringify({
            "query": {
                "bool": {
                    "must": [
                        { "match": { "productGuid.keyword": productId } },
                    ]
                }
            }
        })


        getElasticData(index, commonquery, 0, 0, "").then(json => {
            if (json !== null) {
                if (json.hits.hits.length !== 0) {
                    this.setState({ exactProductDetail: json.hits.hits[0]._source, show_elastic: true }); //minPriceState: minPriceArr[0].price
                }
                else {
                    this.setState({ loading: false, notfound: true })
                }

            } else {
                this.setState({ loading: false, notfound: true })
            }
        }).catch(err => err.response !== undefined ? (err.response.status === 404 ? this.setState({ loading: false, notfound: true }) : '') : '');
    }
    inputChangedHandler = (event, inputIdentifier) => {
        const updatedNewRfqInfo = {
            ...this.state.NewRfq
        };
        let updatedFormElement = {
            ...updatedNewRfqInfo[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedNewRfqInfo[inputIdentifier] = this.checkValidity(updatedFormElement);
        this.setState({ NewRfq: updatedNewRfqInfo });
    }

    registrationHandler = () => {
        this.setState({ showError: true })
        const { stepNext = f => f } = this.props;
        const updatedNewRfqInfo = {
            ...this.state.NewRfq
        };
        let updatedFormElement = {
            ...updatedNewRfqInfo["Title"]
        };


        let formIsValid = true;
        for (let formElementIdentifier in this.state.NewRfq) {
            updatedNewRfqInfo[formElementIdentifier] = this.checkValidity(this.state.NewRfq[formElementIdentifier]);
            formIsValid = updatedNewRfqInfo[formElementIdentifier].valid && formIsValid;
        }
        if (this.state.showProductType) {
            let showProducttypeError = false;
            if (this.state.selectedCategories.length === 0) {
                showProducttypeError = true
                this.setState({ showProducttypeError: showProducttypeError });
            } else {
                showProducttypeError = false;
                this.setState({ showProducttypeError: showProducttypeError });
            }
            if (showProducttypeError === true) {
                formIsValid = false;
            }
        }
        if (formIsValid) {
            let selectedCategories = this.state.selectedCategories;

            let Data = {}
            if (this.state.showProductType) {
                Data = {
                    rfqTitle: updatedFormElement.value,
                    SelectedProductTypeName: selectedCategories[0].categoryName,
                    SelectedProductType: selectedCategories[0].categoryGuid,
                    ProductTypedata: this.state.selectedCategories,
                    isArtworkApplicable: selectedCategories[0].isArtworkApplicable !== undefined ? selectedCategories[0].isArtworkApplicable : false,
                    ProductTypedetails: this.state.ProductTypedetails,
                    unitGuid: this.state.unitGuid,
                    companyGuid: this.state.companyGuid,
                    ProductGuid: this.state.ProductGuid,
                    productName: this.state.productName,
                    companyName: this.state.companyName,
                    supplier_city: this.state.supplier_city,
                    supplier_state: this.state.supplier_state,
                    isCatelogRFQ: this.state.isCatelogRFQ,
                    isExactSupplier: this.state.isExactSupplier,
                    exactProductDetail: this.state.exactProductDetail,
                    unitList: this.state.unitList,
                    defaultAddressGuid: this.state.defaultAddressGuid,
                    buyerDefaultAddressGuid: this.state.buyerDefaultAddressGuid
                }
            }
            else {
                Data = {
                    rfqTitle: updatedFormElement.value,
                    SelectedProductTypeName: this.state.SelectedProductTypeName,
                    SelectedProductType: this.state.SelectedProductType,
                    ProductTypedata: this.state.ProductTypedata,
                    isArtworkApplicable: this.state.isArtworkApplicable,
                    ProductTypedetails: this.state.ProductTypedetails,
                    unitGuid: this.state.unitGuid,
                    companyGuid: this.state.companyGuid,
                    ProductGuid: this.state.ProductGuid,
                    productName: this.state.productName,
                    companyName: this.state.companyName,
                    supplier_city: this.state.supplier_city,
                    supplier_state: this.state.supplier_state,
                    isCatelogRFQ: this.state.isCatelogRFQ,
                    isExactSupplier: this.state.isExactSupplier,
                    exactProductDetail: this.state.exactProductDetail,
                    unitList: this.state.unitList,
                    defaultAddressGuid: this.state.defaultAddressGuid,
                    buyerDefaultAddressGuid: this.state.buyerDefaultAddressGuid
                }
            }
            stepNext(Data, "ProductStep");
        }

        // if (updatedFormElement.value !== undefined && updatedFormElement.value !== null && updatedFormElement.value !== "") {
        //     const Data = {
        //         rfqTitle: updatedFormElement.value
        //     }
        // } else {
        //     const updatedNewRfqInfo = {
        //         ...this.state.NewRfq
        //     };
        //     let updatedFormElement = {
        //         ...updatedNewRfqInfo["Title"]
        //     };
        //     updatedNewRfqInfo["Title"] = this.checkValidity(updatedFormElement)
        // }
    }

    enterkey = event => {
        if (event.key === "Enter") {
            this.registrationHandler(event);
        }
    };

    checkValidity(updatedFormElement) {
        let isValid = true;
        if (!updatedFormElement.validation) {
            isValid = true;
        }
        if (updatedFormElement.validation.required) {
            isValid = updatedFormElement.value.trim() !== '' && updatedFormElement.value !== '0' && isValid;
        }
        if (updatedFormElement.validation.alphabatesOnly && updatedFormElement.value.trim() !== '') {
            let re = /^[a-zA-Z\s]+$/;
            if (!re.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // updatedFormElement.errorMessage = 'Invalid Value. special characters and numbers are not alllowed.';
                // updatedFormElement.newThemeError = 'Invalid Value. special characters and numbers are not alllowed.';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.specialcharactersandnumbersarenotalllowed."; })[0], "Invalid Value. special characters and numbers are not alllowed.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.specialcharactersandnumbersarenotalllowed."; })[0], "Invalid Value. special characters and numbers are not alllowed.") : "";
            }
        }
        if (updatedFormElement.validation.alphaNumericOnly && updatedFormElement.value.trim() !== '') {
            let reAlphaNumeric = /^[a-z0-9]+$/i;
            // if (!reAlphaNumeric.test(updatedFormElement.value) || !isNaN(updatedFormElement.value)) {
            if (!reAlphaNumeric.test(updatedFormElement.value)) {
                isValid = false && isValid;
                // updatedFormElement.errorMessage = 'Invalid Value. only special characters are not alllowed.';
                // updatedFormElement.newThemeError = 'Invalid Value. only special characters are not alllowed.';
                updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.onlyspecialcharactersarenotalllowed."; })[0], "Invalid Value. only special characters are not alllowed.") : "";
                updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.onlyspecialcharactersarenotalllowed."; })[0], "Invalid Value. only special characters are not alllowed.") : "";
            }
        }
        if (updatedFormElement.validation.alphaNumericOnlySpace && updatedFormElement.value.trim() !== '') {
            // let reAlphaNumeric = /^[a-z\d\-. \s]+$/i;
            // if (!reAlphaNumeric.test(updatedFormElement.value)) {
            //     isValid = false && isValid;
            // updatedFormElement.errorMessage = 'Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.';
            // updatedFormElement.newThemeError = 'Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.';
            updatedFormElement.errorMessage = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.otherthanthese(spaces,-,.)otherspecialcharactersarenotalllowed."; })[0], "Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.") : "";
            updatedFormElement.newThemeError = this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "invalidvalue.otherthanthese(spaces,-,.)otherspecialcharactersarenotalllowed."; })[0], "Invalid Value. Other than these (spaces,-,.) other special characters are not alllowed.") : "";
            //  }
        }

        if (updatedFormElement.validation.maxLength && isValid) {
            isValid = updatedFormElement.value.length <= updatedFormElement.validation.maxLength;
            if (!isValid) {
                // updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
                // updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' length is exceeded. Maximum length allowed is ' + updatedFormElement.validation.maxLength + '.'
                updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "lengthisexceeded.maximumlengthallowedis"; })[0], "length is exceeded. Maximum length allowed is") + " " + updatedFormElement.validation.maxLength + '.' : "";
                updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "lengthisexceeded.maximumlengthallowedis"; })[0], "length is exceeded. Maximum length allowed is") + " " + updatedFormElement.validation.maxLength + '.' : "";
            }
        }

        if (updatedFormElement.validation.minLength && isValid) {
            isValid = updatedFormElement.value.length >= updatedFormElement.validation.minLength;
            if (!isValid) {
                updatedFormElement.errorMessage = updatedFormElement.label.replace("*", "") + ' Invalid'
                updatedFormElement.newThemeError = updatedFormElement.label.replace("*", "") + ' Invalid'
            }
        }

        updatedFormElement.valid = isValid;
        updatedFormElement.touched = true;
        return updatedFormElement;
    }
    getRFQLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'createRFQ') + '&size=10000')
            .then(json => {
                this.setState({ rfqLanguageResources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    OnSelectChange = (data) => {
        var categoryName = "";
        let selectedCategories = [];
        selectedCategories = data.selectedCategories;
        let showProducttypeError = false;
        if (selectedCategories.length !== 0) {
            categoryName = data.selectedCategories[0].categoryName;
            showProducttypeError = false;
            this.setState({ showProducttypeError: showProducttypeError });
        }

        this.setState({ ProductTypedetails: data.ProductTypedetails, selectedCategories: selectedCategories, SelectedCategoryName: categoryName });
    }

    render() {
        const formElementsArray = [];
        //let ProductTypedetails = this.props.ProductTypedetails !== undefined ? this.props.ProductTypedetails : [];

        for (let key in this.state.NewRfq) {
            formElementsArray.push({
                id: key,
                config: this.state.NewRfq[key]
            });
        }

        return (
            <React.Fragment>
                <div className="newRfq" style={({ display: this.state.loading ? 'none' : 'flex' })}>
                    <div className="newRfq_left">
                        <div className="rfq_head">
                            {/* <h5 className="rfq_title">Create New RFQ</h5>
                    <p className="rfq_desc">Giving a title to your RFQ will help you quickly identify it in future.</p> */}
                            {/* <h5 className="rfq_title">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "createnewrfq"; })[0], "Create New RFQ") : ""}</h5> */}
                            <p className="rfq_desc">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "givingatitletoyourRFQwillhelpyouquicklyidentifyitinfuture."; })[0], "Giving a title to your RFQ will help you quickly identify it in future.") : ""}</p>
                        </div>
                        <div className="rfq_body">
                            <div className="newThemeInput">
                                {formElementsArray.map(formElement => (
                                    <>
                                        <Input
                                            class={formElement.config.class}
                                            label={formElement.config.label}
                                            key={formElement.id}
                                            elementType={formElement.config.elementType}
                                            elementConfig={formElement.config.elementConfig}
                                            invalid={!formElement.config.valid}
                                            shouldValidate={formElement.config.validation}
                                            touched={formElement.config.touched}
                                            newThemeError={this.state.showError && formElement.config.newThemeError}
                                            changed={event => this.inputChangedHandler(event, formElement.id)}
                                            SelectChange={(event) => this.SelectChangeChangedHandler(event, formElement.id)}
                                            onKeyPress={this.enterkey}
                                            value={formElement.config.value}
                                        />
                                    </>
                                ))}
                                {this.state.showProductType && this.state.ProductTypedetails !== undefined && this.state.ProductTypedetails !== null && this.state.ProductTypedetails.length > 0 ?
                                    <div className="rfq_head">
                                        <h5 className="rfq_title">Select Product Type</h5>
                                    </div>
                                    : ""
                                }
                                {this.state.showProductType && this.state.ProductTypedetails !== undefined && this.state.ProductTypedetails !== null && this.state.ProductTypedetails.length > 0 ?
                                    (<div className="newThemeInput CustomSearchMultiSelectDropdown">
                                        <CustomSearchMultiSelectDropdown_new
                                            ProductTypedetails={this.state.ProductTypedetails}
                                            IsProductShow={true}
                                            IsSingleSelection={true}
                                            customDropTitle={this.state.SelectedCategoryName !== "" ? this.state.SelectedCategoryName : "Select Product"}
                                            // onRef={ref => (this.child = ref)}
                                            onchange={this.OnSelectChange}
                                        >
                                        </CustomSearchMultiSelectDropdown_new>
                                        {this.state.showProducttypeError === true ?
                                            <div class="newThemeError"><p>Select at least one product type</p></div>
                                            : ""
                                        }

                                    </div>)
                                    : ("")
                                }
                            </div>
                        </div>
                        <div className="rfq_action">
                            {/* <Link to='/rfqlisting'><Button blackBtnSimple>Go Back</Button></Link>
                    <Button onClick={() => this.registrationHandler()} orangeSubmit>Proceed</Button> */}

                            {localStorage.urlVal === '' || localStorage.urlVal === undefined || localStorage.urlVal === null ?
                                <Link to='/rfqlisting'><Button className="new_prev_btn_arrow">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "prev"; })[0], "Prev") : ""}</Button></Link>
                                :
                                <Link to={localStorage.urlVal}><Button className="new_prev_btn_arrow">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "prev"; })[0], "Prev") : ""}</Button></Link>
                            }
                            {/* <Link to='/rfqlisting'><Button className="new_prev_btn_arrow">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "prev"; })[0], "Prev") : ""}</Button></Link> */}
                            <Button onClick={() => this.registrationHandler()} className="new_next_btn_arrow">{this.state.rfqLanguageResources !== null ? getLabelText(this.state.rfqLanguageResources.filter(x => { return x.resourceKey === "next"; })[0], "Next") : ""}</Button>
                        </div>
                    </div>
                    <div className="newRfq_right">
                        <img src={require('../../assets/img/create_rfq_right_img.png')} />
                    </div>
                </div>
                <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                    <Spinner />
                </div>
            </React.Fragment>
        )
    }
}
export default NewRfq