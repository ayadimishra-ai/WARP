import Drawer from '@material-ui/core/Drawer';
import Close from "@material-ui/icons/Close";
import Delete from "@material-ui/icons/Delete";
import axios from 'axios';
import queryString from "query-string";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import congrats_bg from '../../assets/img/Signuponboarding/congrats_bg.png';
import CommentsLog from "../../components/AccountOnboarding/CommentsLog";
import { getServiceUrl } from '../../config';
import * as RoleCodes from "../../rolecodes";
import Button from "../../UI/Button/MaterialButton";
import Spinner from "../../UI/Spinner/Spinner";
import CustomSearchMultiSelectDropdown_new from '../SupplierOnBoarding/CustomSearchMultiSelectdropdown_new';

let onfirstload = false;
class ProductInfo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeStep: 0,
            showCommodity: true,
            showCategory: false,
            showProductType: false,
            CompanyName: "",
            CompanyRegistrationnumber: "",
            Pancard: "",
            ProductTypes: [],
            Commoditydetails: [],
            categorydetails: [],
            SubCategorydetails: [],
            selectedCommodity: [],
            selectedCategory: [],
            selectedSubCategory: [],
            selectedproductType: [],
            EnterpriseDetails: null,
            ProductTypedetails: [],
            ExistingselectedproductType: [],
            CommentLog: [],
            CommentLogDetails: [],
            commentError: null,
            IsSRMUser: false,
            NewCompanyName: "",
            loading: true,
            commentDrawer: false,
            ExistingSelectedProductTypeValue: [],
            GeneralDetailsData: [],
            selectedCategories: [],
            DeleteCategoryGuid: ""
        }
    }
    async componentDidMount() {
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            this.setState({ IsSRMUser: true });
        }
        await this.getGetAccountDetails();
        await this.GetProductTypedetails();


    }
    async getGetAccountDetails() {
        let companyGuid = "", Rolename = "", StatusName = "", UserGuid = "00000000-0000-0000-0000-000000000000";
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            let params = queryString.parse(window.location.search);
            companyGuid = params.Companyguid;
            Rolename = params.Rolename;
            StatusName = params.StatusName;
            UserGuid = params.UserGuid;
        }
        else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
            companyGuid = localStorage.companyGuid;
            Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
            StatusName = localStorage.userStatus;
            UserGuid = localStorage.userId;
        }
        else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
            companyGuid = localStorage.companyGuid;
            Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
            StatusName = localStorage.userStatus;
            UserGuid = localStorage.userId;
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) {
            companyGuid = localStorage.companyGuid;
            Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
            StatusName = localStorage.userStatus;
            UserGuid = localStorage.userId;
        }
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                CompanyGuid: companyGuid,
                RoleName: Rolename,
                CompanyStatusName: StatusName,
                UserGuid: UserGuid
            },
        };
        await axios.get(getServiceUrl() + 'Onboarding/GetAccountDetails', config)
            .then((response) => {
                this.setState({ loading: false });
                if (response.status === 200) {
                    if (response.data.table1.length > 0) {
                        let GeneralDetailsData = {};
                        GeneralDetailsData = {
                            'companyName': response.data.table1[0].companyName.trim(), 'LegalStructure': response.data.table1[0].legalStructureGuid !== null && response.data.table1[0].legalStructureGuid !== "" ? response.data.table1[0].legalStructureGuid : "",
                            'CINCRN': response.data.table1[0].companyRegistrationNumber !== null && response.data.table1[0].companyRegistrationNumber !== "" ? response.data.table1[0].companyRegistrationNumber : "",
                            'PAN': response.data.table1[0].panCardNumber !== null && response.data.table1[0].panCardNumber !== "" ? response.data.table1[0].panCardNumber : "",
                        };
                        this.setState({ GeneralDetailsData: GeneralDetailsData });
                    }

                    if (response.data.table3.length > 0) {
                        let CommentLogData = {};
                        CommentLogData = response.data.table3;
                        this.setState({ CommentLogDetails: CommentLogData });
                    }
                }
            }).catch(err => {
                this.setState({ loading: false });
            });
    }
    OnSelectChange = (data) => {
        let selectedCategories = [];
        selectedCategories = data.selectedCategories;
        if (this.state.ExistingSelectedProductTypeValue.length == 0 && onfirstload == true) {
            onfirstload = false;
            let ProductOfferingData = selectedCategories.map((item) => {
                let data = {
                    categoryGuid: "00000000-0000-0000-0000-000000000000",
                    commodityGuid: "00000000-0000-0000-0000-000000000000",
                    productTypeGuid: item.categoryGuid,
                    subCategoryGuid: "00000000-0000-0000-0000-000000000000"
                }
                return data;
            });
            this.setState({ ExistingSelectedProductTypeValue: ProductOfferingData, ProductTypedetails: data.ProductTypedetails, selectedCategories: selectedCategories });
        } else {
            this.setState({ ProductTypedetails: data.ProductTypedetails, selectedCategories: selectedCategories });
        }

    }

    deleteProductType = async (event, categoryGuid, categoryName) => {
        event.stopPropagation();
        let userGuid = "";
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            let params = queryString.parse(window.location.search);
            userGuid = params.UserGuid;
        }
        else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
            userGuid = localStorage.userId;
        }
        
        // if(this.checkcategorymapping(categoryGuid)===false)
        if (categoryGuid !== null || categoryGuid !== undefined || categoryGuid !== "" || categoryGuid !== "null") {

            
            var config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.tokenId,
                    'categoryGuid': categoryGuid,
                    'SupplierGuid': userGuid,
                },
            };
            await axios.get(getServiceUrl() + 'Category/ValidationUpdateProductOffering', config)
                .then(response => {
                    
                   let checkcategorymappedresponse = response.data
                   if (checkcategorymappedresponse ==='Category not mapped')
                   {
                       let selectedCategories = this.state.selectedCategories;
                        var UpdatedselectedCategories = selectedCategories.filter(x => x.categoryGuid !== categoryGuid).map(x => {
                            if (x.categoryGuid !== categoryGuid) {
                                return x;
                            }
                        });
                        let data = {
                            ProductTypedetails: this.state.ProductTypedetails,
                            selectedCategories: UpdatedselectedCategories
                        }
                        this.setState({ DeleteCategoryGuid: categoryGuid });
                         this.OnSelectChange(data);
                        this.setState({ DeleteCategoryGuid: "" });
                    // iscategorymapped=false; 
                   }
                   else{
                    confirmAlert({
                        customUI: ({ onClose }) => <div className="newErrorPopup">
                            <div>
                                <h5>Error</h5>
                                <Close onClick={onClose} />
                            </div>
                            <p>Product Category cannot be removed</p>
                        </div>,
                    });
                  }
                }).catch(err => err.response !== undefined ? err.response.status === 401 ? '' : '' : '');

        }
    
    }

    GetProductTypedetails() {
        this.setState({ loading: true });
        this.setState({ ProductTypedetails: [], ProductTypes: [] });
        let Rolename = "";
        let checkUserGuid = "00000000-0000-0000-0000-000000000000";
        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            let params = queryString.parse(window.location.search);
            Rolename = params.Rolename;
            checkUserGuid = params.UserGuid;
        }
        else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
            Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
            checkUserGuid = localStorage.userId;
        }
        else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
            Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
            checkUserGuid = localStorage.userId;
        }
        else if (JSON.parse(localStorage.userType) == RoleCodes.ORGANIZATIONADMIN) {
            Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
            checkUserGuid = localStorage.userId;
        }
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                "CompanyName": this.state.GeneralDetailsData.companyName,
                "UserGuid": checkUserGuid,
                "CRNNumber": this.state.GeneralDetailsData.CINCRN,
                "PanCardNo": this.state.GeneralDetailsData.PAN,
                "RoleName": Rolename
            }
        };

        axios.get(getServiceUrl() + 'Users/GetCategoryProductTypeDetailsNew', config)
            .then((response) => {
                if (response.data.status200OK) {
                    onfirstload = true;
                    this.setState({ ProductTypedetails: response.data.productTypeDetails.productTypeDetails, loading: false });
                }
            });
    }


    // ProductInfoPrevHandler = (event) => {
    //     const { stepBack = f => f } = this.props;
    //     stepBack(null, null, "Enterprise Info");
    // }
    showCategoryFn = (Data, Name) => {
        if (Data.length > 0) {
            let Getcategorizationdata = this.state.Commoditydetails;
            let categorydata = Getcategorizationdata.filter(item => Data.includes(item.productClassificationGuid)).map(filtereditem => (filtereditem))

            let selectedcategoryList = this.state.selectedCategory;
            if (selectedcategoryList.length > 0) {
                var UpdatedcategoryDetails = categorydata.map(x => {
                    if (Data.includes(x.productClassificationGuid)) {
                        let subcate = x.categoryDetails.map(subitem => {
                            if (selectedcategoryList.includes(subitem.categoryGuid)) {
                                subitem.isSelected = true;
                            }
                            return subitem;
                        });
                        x.categoryDetails = subcate;
                    }
                    return x;
                });
            }

            this.setState({ showCommodity: false, showCategory: true, showSubCategory: false, categorydetails: categorydata, selectedCommodity: Data });
        }
        else {
            const { stepNext = f => f } = this.props;

            stepNext(Data, "Target Market");
        }
    }
    showSubCategoryFn = (Data, Name) => {
        let GetSubcategorizationdata = this.state.categorydetails;
        let selectedCommo = this.state.selectedCommodity;

        let selectedCategoryData = GetSubcategorizationdata.filter(item => selectedCommo.includes(item.productClassificationGuid)).map(filtereditem => (filtereditem));
        let selectedSubCategoryData = selectedCategoryData.filter(x => x.categoryDetails.length > 0).map(({ productClassificationName, productClassificationGuid, isSelected, categoryDetails }) => { let maindata = { productClassificationName: productClassificationName, productClassificationGuid: productClassificationGuid, isSelected: isSelected, categoryDetails: categoryDetails.filter(z => z.isSelected === true ? z.categoryGuid : null) }; return maindata; });

        let selectedSubCategoryList = this.state.selectedSubCategory;
        if (selectedSubCategoryList.length > 0) {
            var UpdatedsubCategoryDetails = selectedSubCategoryData.map(x => {
                x.categoryDetails.map(subitem => {
                    let subCate = subitem.subCategoryDetails.map(sub => {
                        if (selectedSubCategoryList.includes(sub.subCategoryGuid)) {
                            sub.isSelected = true;
                        }
                    });
                    return subCate;
                });
                return x;
            });
        }

        this.setState({ showCommodity: false, showCategory: false, showSubCategory: true, SubCategorydetails: selectedSubCategoryData, selectedCategory: Data });
    }
    showProductTypeFn = (Data, Name) => {
        let GetSubcategorizationdata = this.state.SubCategorydetails;
        let selectedCommo = this.state.selectedCommodity;

        let selectedCategoryData = GetSubcategorizationdata.filter(item => selectedCommo.includes(item.productClassificationGuid)).map(filtereditem => (filtereditem));
        let selectedProductTypeData = selectedCategoryData.filter(x => x.categoryDetails.length > 0).
            map(({ productClassificationName, productClassificationGuid, isSelected, categoryDetails }) => {
                let maindata = {
                    productClassificationName: productClassificationName,
                    productClassificationGuid: productClassificationGuid,
                    isSelected: isSelected,
                    categoryDetails: categoryDetails.filter(z => z.isSelected === true ? z.categoryGuid : null).
                        map(({ categoryGuid, categoryName, isSelected, subCategoryDetails }) => {
                            let submaindata = {
                                categoryGuid: categoryGuid,
                                categoryName: categoryName,
                                isSelected: isSelected,
                                subCategoryDetails: subCategoryDetails.filter(z => z.isSelected === true ? z.subCategoryGuid : null)
                            }
                            return submaindata
                        })
                };
                return maindata;
            });

        let selectedproductList = this.state.selectedproductType;
        if (selectedproductList.length > 0) {
            var UpdatedproductTypeDetails = selectedProductTypeData.map(x => {
                x.categoryDetails.map(subitem => {
                    subitem.subCategoryDetails.map(sub => {
                        let subproductType = sub.productTypeDetail.map(pt => {
                            if (selectedproductList.includes(pt.productGuid)) {
                                pt.isSelected = true;
                            }
                        });
                        return subproductType;
                    });
                });
                return x;
            });
        }
        this.setState({ showCommodity: false, showCategory: false, showSubCategory: false, showProductType: true, ProductTypedetails: selectedProductTypeData, selectedSubCategory: Data });
    }
    showProductTypeFnBack = (value) => {
        this.setState({ showCommodity: false, showCategory: false, showSubCategory: true, showProductType: false });
    }
    showCategoryFnBack = (value) => {
        this.setState({ showCommodity: false, showCategory: true, showSubCategory: false, showProductType: false });
    }
    showCommodityFnBack = (value) => {
        this.setState({ showCommodity: true, showCategory: false, showSubCategory: false, showProductType: false, Commoditydetails: this.state.Commoditydetails });
    }
    commodityclickprev = (event) => {
        // const { stepBack = f => f } = this.props;
        // let selectedCommo = this.state.Commoditydetails;
        // let temporaryholdinginfo = this.props.GetProductInfoDetails;
        // if (temporaryholdinginfo.length > 0) {
        //     let getSelectedCommodity = selectedCommo.filter(item => item.isSelected).map(filtereditem => (filtereditem.productClassificationGuid));
        //     temporaryholdinginfo = temporaryholdinginfo.filter(item => (getSelectedCommodity.includes(item.commodityGuid)))
        // }
        // var UpdatedproductTypeDetails = selectedCommo.map(x => {
        //     if (x.isSelected) {
        //         x.categoryDetails.map(subitem => {
        //             if (subitem.isSelected) {
        //                 subitem.subCategoryDetails.map(sub => {
        //                     if (sub.isSelected) {
        //                         let subproductType = sub.productTypeDetail.map(pt => {
        //                             if (pt.isSelected) {
        //                                 let isexist = temporaryholdinginfo.filter(y => y.commodityGuid === x.productClassificationGuid && y.categoryGuid === subitem.categoryGuid && y.subCategoryGuid === sub.subCategoryGuid && y.productTypeGuid === pt.productGuid).length;
        //                                 if (isexist === 0) {
        //                                     temporaryholdinginfo.push({
        //                                         commodityGuid: x.productClassificationGuid,
        //                                         categoryGuid: subitem.categoryGuid,
        //                                         subCategoryGuid: sub.subCategoryGuid,
        //                                         productTypeGuid: pt.productGuid,
        //                                     })
        //                                 }
        //                             }
        //                         });
        //                         let isexist = temporaryholdinginfo.filter(y => y.commodityGuid === x.productClassificationGuid && y.categoryGuid === subitem.categoryGuid && y.subCategoryGuid === sub.subCategoryGuid).length;
        //                         if (isexist === 0) {
        //                             temporaryholdinginfo.push({
        //                                 commodityGuid: x.productClassificationGuid,
        //                                 categoryGuid: subitem.categoryGuid,
        //                                 subCategoryGuid: sub.subCategoryGuid,
        //                                 productTypeGuid: null,
        //                             })
        //                         }
        //                         return subproductType;
        //                     }
        //                 });
        //                 let isexist = temporaryholdinginfo.filter(y => y.commodityGuid === x.productClassificationGuid && y.categoryGuid === subitem.categoryGuid).length;
        //                 if (isexist === 0) {
        //                     temporaryholdinginfo.push({
        //                         commodityGuid: x.productClassificationGuid,
        //                         categoryGuid: subitem.categoryGuid,
        //                         subCategoryGuid: null,
        //                         productTypeGuid: null,
        //                     })
        //                 }
        //             }
        //         });
        //         let isexist = temporaryholdinginfo.filter(y => y.commodityGuid === x.productClassificationGuid).length;
        //         if (isexist === 0) {
        //             temporaryholdinginfo.push({
        //                 commodityGuid: x.productClassificationGuid,
        //                 categoryGuid: null,
        //                 subCategoryGuid: null,
        //                 productTypeGuid: null,
        //             })
        //         }
        //     }
        //     return x;
        // });
        // if (temporaryholdinginfo.length > 0) {
        //     let selectedData = temporaryholdinginfo.filter(item => item.productTypeGuid != null);
        //     let existData = this.state.ExistingselectedproductType;
        //     let existNew = selectedData.map(filtereditem => (filtereditem.productTypeGuid));
        //     let isUpdateExisting = existNew.filter(item => (!existData.includes(item)));
        //     let isUpdateNew = existData.filter(item => (!existNew.includes(item)));
        //     let IsValid = true;
        //     if (isUpdateExisting.length > 0 || isUpdateNew.length > 0) {
        //         let companyGuid = "", Rolename = "", QueryUserGuid = "00000000-0000-0000-0000-000000000000";
        //         if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
        //             let params = queryString.parse(window.location.search);
        //             companyGuid = params.Companyguid;
        //             Rolename = params.Rolename;
        //             QueryUserGuid = params.UserGuid;
        //             let commentLog = this.state.CommentLog;
        //             if (commentLog.length == 0) {
        //                 IsValid = false;
        //                 this.setState({ loading: false, commentError: 'Comments field is blank. Please enter detail in comments.' });
        //             }
        //         }
        //         else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
        //             companyGuid = localStorage.companyGuid;
        //             Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
        //             QueryUserGuid = localStorage.userId;
        //         }
        //         else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
        //             companyGuid = localStorage.companyGuid;
        //             Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
        //             QueryUserGuid = localStorage.userId;
        //         }
        //         if (IsValid) {
        //             this.setState({ loading: true });
        //             var body = {
        //                 'CompanyGuid': companyGuid,
        //                 'RoleName': Rolename,
        //                 'UserGuid': QueryUserGuid,
        //                 'SrmGuid': localStorage.userId,
        //                 'issubmit': false,
        //                 'Comodity': selectedData
        //             };
        //             var config = {
        //                 headers: {
        //                     'Authorization': 'Bearer ' + localStorage.tokenId,
        //                     'Content-Type': 'application/json'
        //                 },
        //             };
        //             axios.post(getServiceUrl() + 'Onboarding/UpdateAccountDetails?', body, config)
        //                 .then((response) => {
        //                     if (response.status === 200) {
        //                         this.setState({ loading: false });
        //                         let main = {
        //                             EnterpriseDetails: this.state.EnterpriseDetails,
        //                             ProductInfoDetails: selectedData
        //                         }
        //                         window.scrollTo({
        //                             top: 0,
        //                             behavior: "smooth"
        //                         });
        //                         stepBack(null, main, "Enterprise Info");
        //                     }
        //                 }).catch((err) => {
        //                     confirmAlert({
        //                         message: "Something went wrong. Please try again.",
        //                         buttons: [
        //                             {
        //                                 label: 'OK',
        //                                 onClick: () => {
        //                                     this.setState({ loading: false });
        //                                 }
        //                             }
        //                         ]
        //                     });
        //                 });

        //         }
        //     }
        //     else {
        //         let main = {
        //             EnterpriseDetails: this.state.EnterpriseDetails,
        //             ProductInfoDetails: selectedData
        //         }

        //         window.scrollTo({
        //             top: 0,
        //             behavior: "smooth"
        //         });
        //         stepBack(null, main, "Enterprise Info");
        //     }
        // }
        // else {
        //     let main = {
        //         EnterpriseDetails: this.state.EnterpriseDetails,
        //         ProductInfoDetails: temporaryholdinginfo
        //     }

        //     window.scrollTo({
        //         top: 0,
        //         behavior: "smooth"
        //     });
        //     stepBack(null, main, "Enterprise Info");
        // }
    }
    productPrevClick = (event) => {
        this.ManageProductPrevNextClick(false);
    }
    productNextClick = (event) => {
        this.ManageProductPrevNextClick(true);
    }
    ManageProductPrevNextClick = (isNext) => {
        //let selectedCommo = this.state.ProductTypedetails;
        // let temporaryholdinginfo = [];
        // var UpdatedproductTypeDetails = selectedCommo.map(x => {
        //     if (x.isSelected) {
        //         x.categoryDetails.map(subitem => {
        //             if (subitem.isSelected) {
        //                 subitem.subCategoryDetails.map(sub => {
        //                     if (sub.isSelected) {
        //                         let subproductType = sub.productTypeDetail.map(pt => {
        //                             if (pt.isSelected) {
        //                                 temporaryholdinginfo.push({
        //                                     commodityGuid: x.productClassificationGuid,
        //                                     categoryGuid: subitem.categoryGuid,
        //                                     subCategoryGuid: sub.subCategoryGuid,
        //                                     productTypeGuid: pt.productGuid,
        //                                 })
        //                             }
        //                         });
        //                         return subproductType;
        //                     }
        //                 });
        //             }
        //         });

        //     }
        //     return x;
        // });
        let ProductOfferingData = this.state.selectedCategories.map((item) => {
            let data = {
                categoryGuid: "00000000-0000-0000-0000-000000000000",
                commodityGuid: "00000000-0000-0000-0000-000000000000",
                productTypeGuid: item.categoryGuid,
                subCategoryGuid: "00000000-0000-0000-0000-000000000000"
            }
            return data;
        });
        let temporaryProductType = ProductOfferingData;
        //if (temporaryProductType.length > 0) {
        let existData = this.state.ExistingSelectedProductTypeValue.map(filtereditem => (filtereditem.productTypeGuid));
        let existNew = temporaryProductType.map(filtereditem => (filtereditem.productTypeGuid));
        let isUpdateExisting = existNew.filter(item => (!existData.includes(item)));
        let isUpdateNew = existData.filter(item => (!existNew.includes(item)));
        let IsValid = true;

        let Iscomment = false

        if (localStorage.SRMcomment !== undefined && localStorage.SRMcomment !== "" && localStorage.SRMcomment === "false") {
            Iscomment = false;
        }
        else {
            Iscomment = true;
        }

        if (isUpdateExisting.length > 0 || isUpdateNew.length > 0) {
            //if (temporaryProductType.length > 0) {
            let companyGuid = "", Rolename = "", QueryUserGuid = "00000000-0000-0000-0000-000000000000";
            if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
                let params = queryString.parse(window.location.search);
                companyGuid = params.Companyguid;
                Rolename = params.Rolename;
                QueryUserGuid = params.UserGuid;
                let commentLog = this.state.CommentLog;
                if (commentLog.length == 0 || Iscomment === false) {
                    IsValid = false;
                    this.setState({ loading: false, commentDrawer: true, commentError: 'Comments field is blank. Please enter detail in comments.' });
                }
            }
            else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
                companyGuid = localStorage.companyGuid;
                Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
                QueryUserGuid = localStorage.userId;
            }
            else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
                companyGuid = localStorage.companyGuid;
                Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
                QueryUserGuid = localStorage.userId;
            }
            else if (JSON.parse(localStorage.userType) == RoleCodes.ORGANIZATIONADMIN) {
                companyGuid = localStorage.companyGuid;
                Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
                QueryUserGuid = localStorage.userId;
            }
            if (IsValid) {
                this.setState({ loading: true });
                var body = {
                    'CompanyGuid': companyGuid,
                    'RoleName': Rolename,
                    'UserGuid': QueryUserGuid,
                    'SrmGuid': localStorage.userId,
                    'issubmit': false,
                    'Comodity': temporaryProductType
                };
                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.tokenId,
                        'Content-Type': 'application/json'
                    },
                };
                axios.post(getServiceUrl() + 'Onboarding/UpdateAccountDetails?', body, config)
                    .then((response) => {
                        if (response.status === 200) {
                            if (isNext) {
                                this.setState({ loading: false });
                                window.scrollTo({
                                    top: 0,
                                    behavior: "smooth"
                                });
                                const { stepNext = f => f } = this.props;
                                let main = {
                                    ProductInfoDetails: temporaryProductType
                                }
                                stepNext(main, "Facilities");
                            }
                            else {
                                this.setState({ loading: false });
                                let main = {
                                    ProductInfoDetails: temporaryProductType
                                }
                                window.scrollTo({
                                    top: 0,
                                    behavior: "smooth"
                                });
                                const { stepBack = f => f } = this.props;
                                stepBack(main, "Company");
                            }

                        }
                    }).catch((err) => {
                        alert("address Issue");
                        // confirmAlert({
                        //     message: "Something went wrong. Please try again.",
                        //     buttons: [
                        //         {
                        //             label: 'OK',
                        //             onClick: () => {
                        //                 this.setState({ loading: false });
                        //             }
                        //         }
                        //     ]
                        // });
                    });

            }
        }
        else {
            if (isNext) {
                this.setState({ loading: false });
                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
                const { stepNext = f => f } = this.props;
                let main = {
                    ProductInfoDetails: temporaryProductType
                }
                stepNext(main, "Facilities");
            }
            else {
                let main = {
                    ProductInfoDetails: temporaryProductType
                }

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
                const { stepBack = f => f } = this.props;
                stepBack(main, "Company");
            }

        }
        // }
        // else {
        //     if (isNext) {
        //         this.setState({ loading: false });
        //         window.scrollTo({
        //             top: 0,
        //             behavior: "smooth"
        //         });
        //         const { stepNext = f => f } = this.props;
        //         let main = {
        //             ProductInfoDetails: temporaryProductType
        //         }
        //         stepNext(main, "Facilities");
        //     }
        //     else {
        //         let main = {
        //             ProductInfoDetails: temporaryProductType
        //         }

        //         window.scrollTo({
        //             top: 0,
        //             behavior: "smooth"
        //         });
        //         const { stepBack = f => f } = this.props;
        //         stepBack(main, "Company");
        //     }

        // }

    }
    bindCommentLog = (Data) => {
        this.setState({ CommentLog: Data, commentError: null });
    }
    toggleCommentDrawer = (side, open) => () => {
        this.setState({
            [side]: open,
        });
    };
    render() {

        if (this.state.loading) {
            return <Spinner />
        } else {
            return (
                <React.Fragment>
                    {this.state.ProductTypedetails.length > 0 ?
                        <div>
                            <div class="subTitle_header"><p>Thats great, now lets understand your product offering in detail</p><span>Select sub categories that you deal in </span></div>
                            <div>
                                <div style={{ width: '70%' }} className="newThemeInput CustomSearchMultiSelectDropdown">
                                    {this.state.ProductTypedetails.length > 0 ?
                                        (<CustomSearchMultiSelectDropdown_new
                                            ProductTypedetails={this.state.ProductTypedetails}
                                            IsProductShow={false}
                                            IsSingleSelection={false}
                                            onchange={this.OnSelectChange}
                                            customDropTitle="Select Products"
                                            DeleteCategoryGuid={this.state.DeleteCategoryGuid}
                                            Pagestep="onboarding"
                                        >
                                        </CustomSearchMultiSelectDropdown_new>) : ("")
                                    }
                                    <div className="blank_div_dont_delete"></div>
                                </div>
                                <div className="product_info_table">
                                    <h6>Selected Products</h6>
                                    <div className="prodinfotbl_wrap">
                                        <table>
                                            <thead>
                                                <tr>
                                                    {/* <th>Offering</th>
                                                    <th>Category</th>
                                                    <th>Sub-Category</th> */}
                                                    <th>Product Type</th>
                                                    <th style={{ paddingLeft: '30px' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.keys(this.state.selectedCategories).length === 0 ? <tr><td colSpan="5">No product selected</td></tr> : this.state.selectedCategories.map((data, i) => {
                                                    return (
                                                        <React.Fragment>
                                                            <tr>
                                                                {/* <td>{data.productClassificationName}</td>
                                                                <td>{data.categoryName}</td>
                                                                <td>{data.subCategoryName}</td> */}
                                                                <td>{data.categoryName}</td>
                                                                <td style={{ paddingLeft: '30px' }}><Delete onClick={(event) => this.deleteProductType(event, data.categoryGuid, data.categoryName)} style={{ cursor: 'pointer' }} /></td>
                                                            </tr>

                                                        </React.Fragment>
                                                    )
                                                })
                                                }
                                                {/* <tr>
                                                <td>Material</td>
                                                <td>Type</td>
                                                <td>Form</td>
                                            </tr>
                                            <tr>
                                                <td>Material</td>
                                                <td>Type</td>
                                                <td>Form</td>
                                            </tr> */}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            {/* 
                        {this.state.Commoditydetails.length > 0 && this.state.showCommodity && <SelectProductInfo commodityData={this.state.Commoditydetails} selectedCommodity={this.state.selectedCommodity} back={this.commodityclickprev} next={this.showCategoryFn} name={'commodities'} />}
                        {this.state.showCategory && <SelectProductInfo categoryData={this.state.categorydetails} selectedCategory={this.state.selectedCategory} back={this.showCommodityFnBack} next={this.showSubCategoryFn} name={'categories'} />}
                        {this.state.showSubCategory && <SelectProductInfo subCategoryData={this.state.SubCategorydetails} selectedSubCategory={this.state.selectedSubCategory} back={this.showCategoryFnBack} next={this.showProductTypeFn} name={'subcategories'} />}
                        {this.state.showProductType && <SelectProductInfo productTypeData={this.state.ProductTypedetails} selectedProductType={this.state.selectedProductType} back={this.showProductTypeFnBack} next={this.showTargetRegion} name={'product types'} />} */}
                            <div className="supp_onboarding_action_btn">
                                <Button className="outline_btn_new" onClick={this.productPrevClick}>Prev</Button>
                                <Button onClick={this.toggleCommentDrawer('commentDrawer', true)} className="solid_btn_new">{this.state.CommentLogDetails.length > 0 ? "View comments" : "Add comments"}</Button>
                                <Button className="solid_btn_new" onClick={this.productNextClick}>Next</Button>
                            </div>

                        </div>
                        : ("")}
                    <div>
                        <img style={{ width: '80%' }} src={congrats_bg} />
                    </div>
                    <Drawer className="comment_drawer address_drawer" anchor="right" open={this.state.commentDrawer} onClose={this.toggleCommentDrawer('commentDrawer', false)}>
                        <div>
                            {<CommentsLog CommentLogData={this.state.CommentLogDetails} next={this.bindCommentLog} getcommentError={this.state.commentError} />}
                        </div>
                    </Drawer>

                </React.Fragment>
            )
        }
    }

}
export default (ProductInfo);