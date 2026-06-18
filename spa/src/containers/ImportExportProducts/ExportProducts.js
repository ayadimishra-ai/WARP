import React, { Component } from 'react';
import axios from 'axios';
import Aux from '../../hoc/Auxx';
import Spinner from '../../UI/Spinner/Spinner';
import Button from '../../UI/Button/MaterialButton';
import Input from '../../UI/Input/MaterialInput';
import { getLanguageResourceElasticIndex, getLabelText, getServiceUrl, getUserPermision } from '../../config';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import * as RoleCodes from '../../rolecodes';
import * as PageKeys from '../../pagekeys';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { getPageResource, getLanguageList, GetCategoriesWithProducts } from '../../utility';

const initialState = {
    exportForm: {
        language: {
            elementType: 'select',
            elementConfig: {
                type: 'select',
                options: [],
                label: 'Select Language',
                value: ''
            },
            validation: {
                required: true,
            },
            errorMessage: 'Please select a language.',
            valid: false,
            touched: false,
            value:''
        },
        supplier: {
            elementType: "select",
            elementConfig: {
            type: "select",
            options: [],
            label: "Select Supplier",
            value: ""
            },
            validation: {
            required: true
            },
            errorMessage: "Please select supplier.",
            valid: false,
            touched: false
        },
        category: {
            elementType: 'select',
            elementConfig: {
                type: 'select',
                options: [],
                label: 'Select category',
                value: ''
            },
            validation: {
                required: false,
            },
            valid: true,
            value:'',
            touched: false,
        },
        subCategory: {
            elementType: 'select',
            elementConfig: {
                type: 'select',
                options: [],
                label: 'Select sub category',
                value: ''
            },
            validation: {
                required: false,
            },
            valid: true,
            touched: false,
            value:''
        },
      
    },
    formIsValid: false,
    loading: false,
    resources: [],
    languageList: [],
    categoryList: [],
    subCategoryList: [],
    selectedCategory: '',
    selectedLanguage: '',
    selectedSubCategory: '',
    showPage: false,
    selectedSupplierCompanyName: '',
    supplierCompanyList: [],
}

class ExportProducts extends Component {

    state = { ...initialState } // use spread operator to avoid mutation

    stateResetHandler() {
        this.setState(this.initialState)
        const updatedExportForm = {
            ...this.state.exportForm
        };

        updatedExportForm.supplier.value = ''; 
        updatedExportForm.category.value = '';
        updatedExportForm.subCategory.value = '';
        this.setState({
            loading: false,
            //exportForm: updatedExportForm,
            selectedCategory: '',
            //selectedLanguage: '',
            selectedSubCategory: '',
            supplier: '',
        });

    }
    exportDataHandler(event) { 
        event.preventDefault();
        let userId=null;
        if(this.props.userType === RoleCodes.SUPPLIERSUPPORTPERSON){
            userId = this.state.selectedSupplierCompanyName
        }else{
            userId = this.props.userId;
        }
        if (this.state.formIsValid) {
            this.setState({ loading: true })
            var config = {
                headers: {
                    "Authorization": "Bearer " + localStorage.tokenId,
                    'Content-Type': 'application/json',
                    'userGuid': userId,//this.props.userId,
                    'categoryGuid': this.state.selectedCategory,
                    'languageGuid': this.state.selectedLanguage,
                    'subcategoryGuid': this.state.selectedSubCategory,
                    'userType':localStorage.userType !== null?String(localStorage.userType).indexOf("\"") > -1?JSON.parse(localStorage.userType):localStorage.userType:"",
                },
                "responseType": 'blob',
            };
            axios.get(getServiceUrl() + 'Product/ExportProducts', config)
                .then((response) => {
                    const link = document.createElement('a');
                    link.setAttribute("href", window.URL.createObjectURL(new Blob([response.data])));
                    link.setAttribute('download', 'Products.xlsx');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    this.stateResetHandler();
                }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
        }
        else {
            const updatedExportForm = this.state.exportForm
            for (let inputIndentifiers in updatedExportForm) {
                updatedExportForm[inputIndentifiers].touched = !updatedExportForm[inputIndentifiers].valid;
            }
            this.setState({
                exportForm: updatedExportForm,
            });
        }
    }
    checkSelectValidity(value, rules) {
        let isValid = true;
        if (rules.required) {
            isValid = value.trim() !== '0'
        }
        return isValid;
    }
    onSelectChangeHandler = (event, inputIdentifier) => {

        this.setState({ shrink: true });

        const updatedExportForm = {
            ...this.state.exportForm
        };
        const updatedFormElement = {
            ...updatedExportForm[inputIdentifier]
        };
        updatedFormElement.value = event.target.value;
        updatedFormElement.valid = this.checkSelectValidity(updatedFormElement.value, updatedFormElement.validation);
        updatedFormElement.touched = true;
        updatedExportForm[inputIdentifier] = updatedFormElement;
        let formIsValid = updatedFormElement.formIsValid;

        for (let inputIndentifiers in updatedExportForm) {
            formIsValid = updatedExportForm[inputIndentifiers].valid;
        }
        if (inputIdentifier === 'category') {
            this.setState({
                exportForm: updatedExportForm,
                formIsValid: formIsValid,
                selectedCategory: event.target.value
            });
            this.subCategoryList(event.target.value)
        }
        
        if (inputIdentifier === 'subCategory') {
            this.setState({
                exportForm: updatedExportForm,
                formIsValid: formIsValid,
                selectedSubCategory: event.target.value
            });
        }
        if (inputIdentifier === 'language') {
            this.setState({
                exportForm: updatedExportForm,
                formIsValid: formIsValid,
                selectedLanguage: event.target.value
            });
        }
        if (inputIdentifier === 'supplier') {
            this.setState({
                exportForm: updatedExportForm,
                formIsValid: formIsValid,
                selectedSupplierCompanyName: event.target.value
            });
        }
    }
    subCategoryList(categoryGuid) {
        if(this.props.userType === RoleCodes.SUPPLIERSUPPORTPERSON){
            GetCategoriesWithProducts(categoryGuid,this.props.languageId,this.state.selectedSupplierCompanyName).then((subCategoryList) => {
                const updatedExportFormInfo = {
                    ...this.state.exportForm
                };
                updatedExportFormInfo.subCategory.elementConfig.options = subCategoryList;
                this.setState({ exportForm: updatedExportFormInfo });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
        }else{
            GetCategoriesWithProducts(categoryGuid,this.props.languageId,this.props.userId).then((subCategoryList) => {
                const updatedExportFormInfo = {
                    ...this.state.exportForm
                };
                updatedExportFormInfo.subCategory.elementConfig.options = subCategoryList;
                this.setState({ exportForm: updatedExportFormInfo });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
            // this.setState({ exportForm: updatedExportFormInfo });
        }
    }
    categoryList = () => {
        const updatedExportFormInfo = {
            ...this.state.exportForm
        };
        GetCategoriesWithProducts(null,this.props.languageId,this.props.userId).then((categoryList) => {
            updatedExportFormInfo.category.elementConfig.options = categoryList;
            this.setState({ exportForm: updatedExportFormInfo });
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
    }
    languageList() {
        const updatedExportFormInfo = {
            ...this.state.exportForm
        };
        getLanguageList().then((languageList) => {

            updatedExportFormInfo.language.elementConfig.options = languageList;
            this.setState({ exportForm: updatedExportFormInfo, languageList: languageList });
            if (languageList.length === 1) {
                updatedExportFormInfo.language.value = languageList[0].Id
                updatedExportFormInfo.language.valid = true;
                updatedExportFormInfo.language.touched = true;
                this.setState({
                    exportForm: updatedExportFormInfo,
                    selectedLanguage: updatedExportFormInfo.language.value,
                    formIsValid: true,
                    showPage: true,
                });
            }
            else{
                this.setState({
                    exportForm: updatedExportFormInfo,
                    selectedLanguage: updatedExportFormInfo.language.value,
                    formIsValid: false,
                    showPage: true,
                });
            }
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');
    }

    getSupplierCompanyList=()=>{
        var config = {
          headers: {
              'Authorization': 'Bearer ' + localStorage.tokenId,
              'Content-Type': 'application/json',
          },
        };
        axios.get(getServiceUrl() + 'Users/GetParentSupplierCompanyListForImport', config)
            .then((response) => { 
                if (response.data !== null) {
                    let list = [];
                    response.data.table1.map(item => {
                        list.push({Id: item.userGuid,
                        Value: item.supplierCompanyName})
                    })
                    const updatedExportFormInfo = { ...this.state.exportForm };
                    updatedExportFormInfo.supplier.elementConfig.options = list;
                    this.setState({ exportForm: updatedExportFormInfo, supplierCompanyList: list });
                    if (list.length === 1) {
                        updatedExportFormInfo.supplier.value = list[0].Id
                        updatedExportFormInfo.supplier.valid = true;
                        updatedExportFormInfo.supplier.touched = true;
                        this.setState({
                            exportForm: updatedExportFormInfo,
                            selectedSupplierCompanyName: updatedExportFormInfo.supplier.value,
                            formIsValid: true,
                            showPage: true,
                        });
                    }
                    else{
                        this.setState({
                            exportForm: updatedExportFormInfo,
                            selectedSupplierCompanyName: updatedExportFormInfo.supplier.value,
                            formIsValid: false,
                            showPage: true,
                        });
                    }
                }
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    }

    componentDidMount() {
        this.categoryList()
        this.languageList()
        if(this.props.userType === RoleCodes.SUPPLIERSUPPORTPERSON){
            const updatedExportFormInfo = { ...this.state.exportForm };
            updatedExportFormInfo.supplier.valid = false;
            updatedExportFormInfo.supplier.touched = false;
            this.setState({exportForm: updatedExportFormInfo});

            this.getSupplierCompanyList();
        }else if(this.props.userType === RoleCodes.SUPPLIER){
            const updatedExportFormInfo = { ...this.state.exportForm };
            updatedExportFormInfo.supplier.valid = true;
            updatedExportFormInfo.supplier.touched = true;
            this.setState({exportForm: updatedExportFormInfo});
        }
        getPageResource(getLanguageResourceElasticIndex(this.props.languageId, 'importexport'))
            .then(json => {
                this.setState({ resources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname='/' : '' : '');

    }

    render() {
        let pageBody = <Spinner />
        if (getUserPermision(this.props.permissions, PageKeys.productimportexport) === null) {
            return <Redirect to="/home" />
        }

        // if(JSON.parse(localStorage.userType) === "SUPPLIER")
        // {
        //     if(localStorage.userStatus !== "Account Approved")
        //     {
        //     return ("")
        //     }
        // }

        const { resources } = this.state;
        let formElementsArray = [];

        for (let key in this.state.exportForm) {
            formElementsArray.push({
                id: key,
                config: this.state.exportForm[key]
            });
        }
        if(this.props.userType === RoleCodes.SUPPLIER){
            if (this.state.languageList.length === 1) {
              formElementsArray = formElementsArray.filter(x => x.id !== "language" && x.id !== "supplier");
            }
        }
        if(this.props.userType === RoleCodes.SUPPLIERSUPPORTPERSON){
            if (this.state.languageList.length === 1) {
              formElementsArray = formElementsArray.filter(x => x.id !== "language");
            }
        }

        switch (this.props.userType) {
            case RoleCodes.SUPPLIER:
                if (!this.state.loading) {
                    if (this.state.showPage) {
                        pageBody = <form className="export-form" onSubmit={this.submitHandler}>
                            <GridContainer>
                                <GridItem className="expo_grid_item" lg={12} md={12} sm={12} xs={12}>
                                    {formElementsArray.map(formElement => (
                                        <Input
                                            key={formElement.id}
                                            label={formElement.config.label}
                                            elementType={formElement.config.elementType}
                                            elementConfig={formElement.config.elementConfig}
                                            invalid={!formElement.config.valid}
                                            shouldValidate={formElement.config.validation}
                                            touched={formElement.config.touched}
                                            errorMessage={formElement.config.errorMessage}
                                            value={formElement.config.value}
                                            SelectChange={(event) => this.onSelectChangeHandler(event, formElement.id)}
                                        />
                                    ))}
                                </GridItem>
                            </GridContainer>
                            <Button
                                orangeSubmit
                                btnType="btnDefault"
                                onClick={(event) => this.exportDataHandler(event)}>
                                {
                                    getLabelText(resources.filter((x) => { return x.resourceKey === 'exportbutton' })[0], "Export")
                                }
                            </Button>

                        </form>
                    }
                }

                return <Aux>
                    <div className="export_div">
                        <span>
                            {
                                getLabelText(
                                    resources.filter((x) => { return x.resourceKey === 'exportproducts' })[0],
                                    "Export products"
                                )
                            }
                        </span>
                        {pageBody}
                    </div>
                </Aux>
            case RoleCodes.SUPPLIERSUPPORTPERSON:
                if (!this.state.loading) {
                    if (this.state.showPage) {
                        pageBody = <form className="export-form" onSubmit={this.submitHandler}>
                            <GridContainer>
                                <GridItem className="expo_grid_item" lg={12} md={12} sm={12} xs={12}>
                                    {formElementsArray.map(formElement => (
                                        <Input
                                            key={formElement.id}
                                            label={formElement.config.label}
                                            elementType={formElement.config.elementType}
                                            elementConfig={formElement.config.elementConfig}
                                            invalid={!formElement.config.valid}
                                            shouldValidate={formElement.config.validation}
                                            touched={formElement.config.touched}
                                            errorMessage={formElement.config.errorMessage}
                                            value={formElement.config.value}
                                            SelectChange={(event) => this.onSelectChangeHandler(event, formElement.id)}
                                        />
                                    ))}
                                </GridItem>
                            </GridContainer>
                            <Button
                                orangeSubmit
                                btnType="btnDefault"
                                onClick={(event) => this.exportDataHandler(event)}>
                                {
                                    getLabelText(resources.filter((x) => { return x.resourceKey === 'exportbutton' })[0], "Export")
                                }
                            </Button>

                        </form>
                    }
                }
                return <Aux>
                    <div className="export_div">
                        <span>
                            {
                                getLabelText(
                                    resources.filter((x) => { return x.resourceKey === 'exportproducts' })[0],
                                    "Export products"
                                )
                            }
                        </span>
                        {pageBody}
                    </div>
                </Aux>
            default:
                return <Redirect to="/home" />
        }
    }
}

const mapStateToProps = state => {
    return {
        userId: state.login.userId,
        userType: state.login.userType,
        tokenId: state.login.tokenId,
        languageId: state.login.languageId,
        permissions: state.login.permissions,
    };
}
export default connect(mapStateToProps)(ExportProducts);
