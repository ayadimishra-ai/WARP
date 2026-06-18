import Edit from "@material-ui/icons/Edit";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Sort from "@material-ui/icons/Sort";
import axios from "axios";
import { createBrowserHistory } from 'history';
import React, { Component } from "react";
import { confirmAlert } from "react-confirm-alert";
import { Redirect } from "react-router-dom";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import {
  getAWSUrl, getServiceUrl, getUserPermision, getWebsiteGUID
} from "../../config";
import * as PageKeys from "../../pagekeys";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from "../../UI/Spinner/Spinner";
import {
  getAllCategoryList, getCommodityList, getParentCategoryList
} from "../../utility";

const createBrowserHistorypush = createBrowserHistory({ forceRefresh: true });



//import elasticsearch from 'elasticsearch';
//import connectionClass from 'http-aws-es';
//import AWS from 'aws-sdk';

const initialState = {
  categoryForm: {
    category: {
      elementType: "input_2",
      class: "newInput_2",
      elementConfig: {
        type: "text",
        // placeholder: "Category"
      },
      value: "",
      validation: {
        required: true,
        alphaNumericOnly: true,
        maxLength: 50
      },
      requiredclass: "required",
      valid: true,
      touched: false,
      formControlProps: { fullWidth: true },
      label: "Category *"
    },
    commodity: {
      elementType: "select_2",
      class: "newInput_2",
      elementConfig: {
        // type: "select",
        options: [],
        // value: 0
      },
      value: '',
      label: "Select Commodity *",
      validation: {
        required: true
      },
      errorMessage: "Please select a commodity.",
      valid: false,
      touched: false
    },
    parentcategory: {
      elementType: "select_2",
      class: "newInput_2",
      elementConfig: {
        // type: "select",
        options: [],
        // value: "0",
        disabled: true
      },
      value: '',
      validation: {
        required: false
      },
      label: "Parent Category"
    },
    Emission: {
      elementType: "input_2",
      class: "newInput_2",
      elementConfig: {
        type: "text",
        // placeholder: "Category"
      },
      value: "",
      validation: {
        required: true,
        alphaNumericOnly: true,
        maxLength: 50
      },
      requiredclass: "required",
      valid: true,
      touched: false,
      formControlProps: { fullWidth: true },
      label: "Emission factor *"
    },
    CatImage: {
      elementType: "file",
      elementConfig: {
        type: "file",
        height: 350,
        width: 1250,
        size: 15,
        unit:"MB"
      },
      validation: {
        required: false
      },
      errorMessage: "Please select a .png file.",
      valid: false,
      touched: false,
      fileLabel: 'Category image'
    },
    CatIcon: {
      elementType: "file",
      elementConfig: {
        type: "file",
        height: 150,
        width: 150,
        size: 100,
        unit:"KB"
      },
      validation: {
        required: false
      },
      errorMessage: "Please select a .png file.",
      valid: false,
      touched: false,
      fileLabel: 'Category icon'
    },
  },
  isValid: false,
  errorMessage: "",
  loading: false,
  selectedFile: null,
  selectedFileName: null,
  SubmitButton: "Add",
  categoryList: [],
  categoryGuid: null,
  CategoryImage: null,
  imageUploadError: null,
  imageUploaded: false,
  oldValues: [],
  newValues: [],
  searchCategory: "",
  alphaNumericOnly: true,
  paste: false,
  sort: true,
  selectedFileIcon: null,
  selectedFileIconName: null,
  CategoryIcon: null,
  UploadType:null,
  createdOnsort:true,
  createdBysort:true,
  modifiedOnsort:true,
  modifiedBysort:true,
  commoditysort: true,
  pCategorysort:true,
  emissionsort:true
  
};

class CategoryManagement extends Component {
  state = { ...initialState }; // use spread operator to avoid mutation

  constructor(props) {
    super(props);
    this.changeSearch = this.changeSearch.bind(this);
    this.getAllCategoryList = this.getAllCategoryList.bind(this);
  }

  handleChange(checked) {
    this.setState({ checked });
  }

    componentDidUpdate() {
        if (localStorage.isRefreshed !== undefined && localStorage.isRefreshed === 'true') {
            var path = window.location.href;
            var page = path.split("/").pop();
            localStorage.removeItem('isRefreshed', false);
            createBrowserHistorypush.push("/" + page);
        } else {
        }
    }


  async componentDidMount() {
    await this.commodityList();
    await this.getAllCategoryList("");
    const updatedCategoryForm = {
      ...this.state.categoryForm
    };
    const parentCategoryElement = {
      ...updatedCategoryForm["parentcategory"]
    };
    const productClassificationNameElement = {
      ...updatedCategoryForm["commodity"]
    };
    // const EmissionElement = {
    //   ...updatedCategoryForm["Emission"]
    // };
    parentCategoryElement.value = "";
    productClassificationNameElement.value = "";
    //EmissionElement.value="";

    updatedCategoryForm["parentcategory"] = parentCategoryElement;
    updatedCategoryForm["commodity"] = productClassificationNameElement;
    //updatedCategoryForm["Emission"]=EmissionElement;
    this.setState({
      categoryForm: updatedCategoryForm,
      SubmitButton: "Add",
      categoryGuid: null,
      CategoryImage: null,
      selectedFile: null,
      CategoryIcon: null,
      selectedFileIcon: null
    });
  }
  resetSearch=()=> {
    this.getAllCategoryList("");
    this.setState({ searchCategory: "" });
  }
  async getAllCategoryList(categoryName) {
    this.setState({
      loading: true
    });
    await getAllCategoryList(categoryName)
      .then(categoryList => {
        this.setState({
          categoryList: categoryList,
          loading: false
        });
      })
      .catch(err =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/logout")
            : ""
          : ""
      );
  }
  async parentCategoryList(commodityGuid) {
    const updatedFormInfo = {
      ...this.state.categoryForm
    };
    await getParentCategoryList(commodityGuid)
      .then(parentCategoryList => {
        updatedFormInfo.parentcategory.elementConfig.options = parentCategoryList;
        this.setState({
          categoryForm: updatedFormInfo
        });
        
      })
      .catch(err =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/logout")
            : ""
          : ""
      );
  }
  async commodityList() {
    this.setState({
      loading: true
    });
    const updatedFormInfo = {
      ...this.state.categoryForm
    };
    await getCommodityList()
      .then(commodityList => {
        updatedFormInfo.commodity.elementConfig.options = commodityList;
        this.setState({
          categoryForm: updatedFormInfo,
          loading: false
        });
      })
      .catch(err =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/logout")
            : ""
          : ""
      );
  }
  async checkValidation(categoryName, commodityName,Emission) {
    let isValid = true;
    let errorMessage = "";
    if ( categoryName === null || categoryName === undefined || categoryName === "" ) {
      isValid = false;
      errorMessage = "Category is mandatory";
    } 
    else if ( commodityName === null || commodityName === undefined || commodityName === "") {
      isValid = false;
      errorMessage = "Commodity is mandatory";
    }
    else if ( Emission === null || Emission === undefined || Emission === "") {
      isValid = false;
      errorMessage = "Emission is mandatory";
    }

    this.setState({
      isValid: isValid,
      errorMessage: errorMessage
    });
  }
  changeSearch(event) {
    this.setState({ searchCategory: event.target.value });
  }
  async upsertCategory(event) {
    this.setState({ loading: true });
    event.preventDefault();
    const updatedCategoryForm = {
      ...this.state.categoryForm
    };
    
    await this.checkValidation(
      updatedCategoryForm.category.value,
      updatedCategoryForm.commodity.value,
      updatedCategoryForm.Emission.value
    );
    if (this.state.isValid) {
      if (this.state.selectedFileIcon !== null) {
        this.setState({ UploadType: "CategoryIcon" });
        await this.uploadImage(this.state.selectedFileIcon);
        
      }
      if (this.state.selectedFile !== null) {
        this.setState({ UploadType: "CategoryImage" });
        await this.uploadImage(this.state.selectedFile);
      }

      if (this.state.imageUploadError === null) {
        const formData = {
          CategoryGuid: this.state.categoryGuid,
          CategoryName: updatedCategoryForm.category.value,
          LanguageGuid: localStorage.getItem("languageId"),
          ParentCategoryGuid: updatedCategoryForm.parentcategory.value=='' ? null :updatedCategoryForm.parentcategory.value,
          CommodityGuid: updatedCategoryForm.commodity.value,
          CategoryImage: this.state.CategoryImage,
          IsActive: 1,
          WebsiteGuid: getWebsiteGUID(),
          UserGuid: localStorage.getItem("userId"),
          Action: this.state.SubmitButton.toUpperCase(),
          OldValuesXML: JSON.stringify(this.state.oldValues),
          NewValuesXML: JSON.stringify(this.state.newValues),
          PageName: window.location.href,
          CategoryIcon: this.state.CategoryIcon,
          EmissionFactor: updatedCategoryForm.Emission.value,
        };
       
        var config = {
          headers: {
            Authorization: "Bearer " + localStorage.tokenId,
            "Content-Type": "application/json"
          }
        };
        await axios
          .post(getServiceUrl() + "Category/UpsertCategory", formData, config)
          .then(response => {
            this.getAllCategoryList(this.state.searchCategory);
            this.setState({ loading: false });
            let message = response.data.table1[0].column1
            if (this.state.SubmitButton.toUpperCase() === 'UPDATE') {
              message = response.data.table1[0].column1.concat(this.state.imageUploaded ? " Banner uploaded successfully" : "");
            }
             this.resetForm();
            confirmAlert({
              message: message=="INSERTED SUCCESSFULLY"? "Category added successfully" : message=="UPDATED SUCCESSFULLY"? "Category updated successfully":message,
              buttons: [
                {
                  label: "OK"
                }
              ]
            });
          //   confirmAlert({
          //     customUI: ({ onClose }) => <div className="newSuccessPopup">
          //         <div>
          //             <h5>Success</h5>
          //            <Close onClick={()=> {onClose();} } />
          //         </div>
          //         <p>{message=="INSERTED SUCCESSFULLY"? "Category added successfully" : message=="UPDATED SUCCESSFULLY"? "Category updated successfully":message }</p>
          //     </div>,
          // });	
          })
          .catch(err =>
            err.response !== undefined
              ? err.response.status === 401
                ? (window.location.pathname = "/logout")
                : ""
              : ""
          );
      } else {
        this.setState({ loading: false });
        confirmAlert({
          message: this.state.imageUploadError,
          buttons: [
            {
              label: "OK"
            }
          ]
        });
      //   confirmAlert({
      //     customUI: ({ onClose }) => <div className="newErrorPopup">
      //         <div>
      //             <h5>Error</h5>
      //            <Close onClick={()=> {onClose();} } />
      //         </div>
      //         <p>{this.state.imageUploadError }</p>
      //     </div>,
      // });	
      }
    } 
    else {
      this.setState({ loading: false });
      confirmAlert({
        message: this.state.errorMessage,
        buttons: [
          {
            label: "OK"
          }
        ]
      });
    //   confirmAlert({ 
    //     customUI: ({ onClose }) => <div className="newErrorPopup">
    //         <div>
    //             <h5>Error</h5>
    //            <Close onClick={()=> {onClose();} } />
    //         </div>
    //         <p>{this.state.errorMessage }</p>
    //     </div>,
    // });	
    }
  }

  // async deleteCategoryConfirmation(categoryGuid, isActive, action,categoryImage,categoryIcon) {
  //  confirmAlert ({
  //     message: "Are you sure, you want to delete category?",
  //     buttons: [
  //       {
  //         label: "Yes",
  //         onClick: () => this.deleteCategory(categoryGuid, isActive, action,categoryImage,categoryIcon)
  //       },
  //       {
  //         label: "No"
  //       }
  //     ]
  //   });
  // }

  // async deleteCategory(categoryGuid, isActive, action,categoryImage,categoryIcon) {
  //   const formData = {
  //     CategoryGuid: categoryGuid,
  //     IsActive: !isActive,
  //     UserGuid: localStorage.getItem("userId"),
  //     Action: action.toUpperCase(),
  //     OldValuesXML: categoryGuid,
  //     NewValuesXML: "Deleted",
  //     PageName: window.location.href,
  //     CategoryImage:categoryImage,
  //     CategoryIcon:categoryIcon
  //   };
  //   this.setState({   
  //     loading: true
  //   });
  //   var config = {
  //     headers: {
  //       Authorization: "Bearer " + localStorage.tokenId,
  //       "Content-Type": "application/json"
  //     }
  //   };
  //   await axios
  //     .post(getServiceUrl() + "Category/ChangeCategoryStatus", formData, config)
  //     .then(response => {
  //       this.getAllCategoryList("");
  //       this.resetSearch();
  //       confirmAlert({
  //         message: response.data.table1[0].column1,
  //         buttons: [
  //           {
  //             label: "OK"
  //           }
  //         ]
  //       });
  //     //   confirmAlert({
  //     //     customUI: ({ onClose }) => <div className="newSuccessPopup">
  //     //         <div>
  //     //             <h5>Success</h5>
  //     //            <Close onClick={()=> {onClose();} } />
  //     //         </div>
  //     //         <p>{response.data.table1[0].column1}</p>
  //     //     </div>,
  //     // });	
  //     })
  //     .catch(err =>
  //       err.response !== undefined
  //         ? err.response.status === 401
  //           ? (window.location.pathname = "/logout")
  //           : ""
  //         : ""
  //     );
  // }

  async ChangeCategoryStatus(categoryGuid, isActive, action) {
    const formData = {
      CategoryGuid: categoryGuid,
      IsActive: !isActive,
      UserGuid: localStorage.getItem("userId"),
      Action: action.toUpperCase()
    };
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json"
      }
    };
   
    await axios
      .post(getServiceUrl() + "Category/ChangeCategoryStatus", formData, config)
      .then(response => {
        this.getAllCategoryList("");
        confirmAlert({
          message: response.data.table1[0].column1,
          buttons: [
            {
              label: "OK"
            }
          ]
        });
        
      })
      .catch(err =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/logout")
            : ""
          : ""
      );
  }

  enterkey = (e) => {
      this.setState({ paste: false })
      var keyCode = e.keyCode || e.which;
      //Regex for Valid Characters i.e. Alphabets and Numbers.
      var regex = /[/[a-zA-Z &]+$/;

      //Validate TextBox value against the Regex.
      var isValid = regex.test(String.fromCharCode(keyCode));
      this.setState({ alphaNumericOnly: isValid })
  }

  onPaste = () => {
      this.setState({ paste: true })
  }
  async ChangeHandler(event, inputIdentifier) {
    const updatedCategoryForm = {
      ...this.state.categoryForm
    };

    const updatedFormElement = {
      ...updatedCategoryForm[inputIdentifier]
    };

    updatedFormElement.value = event.target.value;
    updatedCategoryForm[inputIdentifier] = updatedFormElement;

    if (inputIdentifier === "commodity") {
      this.setState({
        categoryForm: updatedCategoryForm,
        newValues: updatedCategoryForm
      });
      await this.parentCategoryList(event.target.value);
      updatedCategoryForm["parentcategory"].elementConfig.disabled = false;
    }
    if (inputIdentifier === "parentcategory") {
      this.setState({
        categoryForm: updatedCategoryForm,
        newValues: updatedCategoryForm
      });
     
    }
    if (inputIdentifier === "CatImage") {
      var regex = new RegExp("([a-zA-Z0-9s_\\.-:])+(.jpg|.png|.jpeg|.svg)$");
      if (!regex.test(event.target.files[0].name.toLowerCase())) {
        event.target.value=null;
        confirmAlert({
          message: "Please select a valid Image file.",
          buttons: [
            {
              label: "OK"
            }
          ]
        });
        this.setState({
          selectedFile: null,
          CategoryImage: null
        });
      } else {
        this.setState({
          categoryForm: updatedCategoryForm,
          newValues: updatedCategoryForm,
          selectedFile:
            event.target.files !== undefined ? event.target.files[0] : null,
          CategoryImage:
            event.target.files !== undefined ? null : this.state.CategoryImage
        });
       // event.target.value = null;
      }
      
    }
    if (inputIdentifier === "CatIcon") {
      var regex = new RegExp("([a-zA-Z0-9s_\\.-:])+(.jpg|.png|.jpeg|.svg)$");
      if (!regex.test(event.target.files[0].name.toLowerCase())) {
        event.target.value=null;
        confirmAlert({
          message: "Please select a valid Image file.",
          buttons: [
            {
              label: "OK"
            }
          ]
        });
        this.setState({
          selectedFileIcon: null,
          CategoryIcon: null
        });
      } else {
        this.setState({
          categoryForm: updatedCategoryForm,
          newValues: updatedCategoryForm,
          selectedFileIcon:
            event.target.files !== undefined ? event.target.files[0] : null,
          CategoryIcon:
            event.target.files !== undefined ? null : this.state.CategoryIcon
        });
       
       
      }
    }
    if (inputIdentifier === "category") {
      if (this.state.alphaNumericOnly) {
        if (
          event.target.value.length <= updatedFormElement.validation.maxLength
        ) {
          this.setState({
            categoryForm: updatedCategoryForm,
            newValues: updatedCategoryForm
          });
        }
      }
    }
    if(inputIdentifier=="Emission"){
       // var regex = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;
        var regex = /^[0-9]*(\.[0-9]{0,2})?$/;
        var isValid = regex.test(event.target.value);
        if(isValid)
        {
          if (event.target.value.length <= updatedFormElement.validation.maxLength ) {
            this.setState({
                categoryForm: updatedCategoryForm,
                newValues: updatedCategoryForm
            });
          }
        }
      } 
    else {
      this.setState({
        categoryForm: updatedCategoryForm,
        newValues: updatedCategoryForm
      });
    }
  }
  async editForm(categoryName, parentCategoryGuid, productClassificationGuid, categoryImage, categoryGuid, emission,categoryIcon) {
    document.documentElement.scrollTop = 0;
    const updatedCategoryForm = {
      ...this.state.categoryForm
    };

    const categoryNameElement = {
      ...updatedCategoryForm["category"]
    };
    const parentCategoryElement = {
      ...updatedCategoryForm["parentcategory"]
    };
    const productClassificationNameElement = {
      ...updatedCategoryForm["commodity"]
    };
    const emissionElement = {
      ...updatedCategoryForm["Emission"]
    };
    

    categoryNameElement.value = categoryName;
    parentCategoryElement.value = parentCategoryGuid;
    parentCategoryElement.elementConfig.disabled = false;
    productClassificationNameElement.value = productClassificationGuid;
    emissionElement.value = emission;

    await this.parentCategoryList(productClassificationNameElement.value);
    updatedCategoryForm["category"] = categoryNameElement;
    updatedCategoryForm["parentcategory"] = parentCategoryElement;
    updatedCategoryForm["commodity"] = productClassificationNameElement;
    updatedCategoryForm["Emission"]=emissionElement;
   
    this.setState({
      categoryForm: updatedCategoryForm,
      oldValues: updatedCategoryForm,
      SubmitButton: "Update",
      categoryGuid: categoryGuid,
      CategoryImage: categoryImage,
      CategoryIcon:categoryIcon,
     
    });
    
  }
 
  async uploadImage(fileValue) {
    var regex = new RegExp("([a-zA-Z0-9s_\\.-:])+(.jpg|.png|.gif|.svg)$");
    if (regex.test(fileValue.name.toLowerCase())) {
      const formData = new FormData();

      formData.append(
        "files",
        fileValue,
        fileValue.name
      );
      var config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "multipart/form-data",
           UploadType:this.state.UploadType
        }
      };
      // await axios
      //   .post(getServiceUrl() + "FileUpload/uploadfile", formData, config)
      //   .then(response => {
      //     if (response.data.indexOf("dimensions") === -1) {
      //       if(this.state.UploadType=="CategoryImage"){
      //       this.setState({
      //         CategoryImage: response.data,
      //         imageUploadError: null,
      //         imageUploaded: true
      //       });
      //     }
      //     else{
      //       this.setState({
      //         CategoryIcon: response.data,
      //         imageUploadError: null,
      //         imageUploaded: true
      //       });
      //     }
      //     } else {
      //       this.setState({ imageUploadError: response.data, imageUploaded: false });
      //     }
          
      //   });
    } else {
      this.setState({ imageUploadError: "Please select a valid Image file." });
    }
  }
  async sortCategoryManagement(ColumnName){
    switch(ColumnName){
      case"CategoryName":
      if (this.state.sort) {
        this.setState({
          sort: !this.state.sort,
          createdOnsort:true,
          createdBysort:true,
          modifiedOnsort:true,
          modifiedBysort:true,
          commoditysort: true,
          pCategorysort:true,
          emissionsort:true,
          categoryList: this.state.categoryList.sort((a, b) =>
            a.categoryName.toString().toLowerCase() > b.categoryName.toString().toLowerCase() ? 1 : -1
          )
        });
      } else {
        this.setState({
          sort: !this.state.sort,
          createdOnsort:true,
          createdBysort:true,
          modifiedOnsort:true,
          modifiedBysort:true,
          commoditysort: true,
          pCategorysort:true,
          emissionsort:true,
          categoryList: this.state.categoryList.sort((a, b) =>
            a.categoryName.toString().toLowerCase() < b.categoryName.toString().toLowerCase() ? 1 : -1
          )
        });
      }
      break;
      case"EmissionFactor":
    if (this.state.emissionsort) {
      this.setState({
        emissionsort: !this.state.emissionsort,
        createdOnsort:true,
        createdBysort:true,
        modifiedOnsort:true,
        modifiedBysort:true,
        commoditysort: true,
        pCategorysort:true,
        sort:true,
        categoryList: this.state.categoryList.sort((a, b) =>
          a.emission > b.emission ? 1 : -1
        )
      });
    } else {
      this.setState({
        emissionsort: !this.state.emissionsort,
        createdOnsort:true,
        createdBysort:true,
        modifiedOnsort:true,
        modifiedBysort:true,
        commoditysort: true,
        pCategorysort:true,
        sort:true,
        categoryList: this.state.categoryList.sort((a, b) =>
          a.emission < b.emission ? 1 : -1
        )
      });
    }
      break;
      case"CommodityName":
      const arrcommodityname = this.state.categoryList.filter(el => {
        return el.productClassificationName != null && el.productClassificationName != ''
       });
       const arrcommoditynamenull = this.state.categoryList.filter(el => {
        return el.productClassificationName === null 
       });
       
      if (this.state.commoditysort) {
        await this.setState({
          commoditysort: !this.state.commoditysort,
          createdOnsort:true,
          createdBysort:true,
          modifiedOnsort:true,
          modifiedBysort:true,
          sort: true,
          pCategorysort:true,
          emissionsort:true,
          categoryList: arrcommodityname.sort((a, b) =>
            a.productClassificationName > b.productClassificationName ? 1 : -1
          )
        });
        await this.setState({ categoryList: [...this.state.categoryList, ...arrcommoditynamenull] });
      } else {
        await this.setState({
          commoditysort: !this.state.commoditysort,
          createdOnsort:true,
          createdBysort:true,
          modifiedOnsort:true,
          modifiedBysort:true,
          sort: true,
          pCategorysort:true,
          emissionsort:true,
          categoryList: arrcommodityname.sort((a, b) =>
            a.productClassificationName < b.productClassificationName ? 1 : -1
          )
        });
        await this.setState({ categoryList: [...arrcommoditynamenull,  ...this.state.categoryList ] });
      }
      break;
      case"ParentCategory":
      const arrParentCategory = this.state.categoryList.filter(el => {
        return el.parentCategory != null && el.parentCategory != ''
       });
       const arrParentCategorynull = this.state.categoryList.filter(el => {
        return el.parentCategory === null 
       });
    if (this.state.pCategorysort) {
       await this.setState({
        pCategorysort: !this.state.pCategorysort,
        createdOnsort:true,
        createdBysort:true,
        modifiedOnsort:true,
        modifiedBysort:true,
        commoditysort: true,
        sort:true,
        emissionsort:true,
        categoryList: arrParentCategory.sort((a, b) =>
          a.parentCategory > b.parentCategory ? 1 : -1
        )
      });
      await this.setState({ categoryList: [ ...this.state.categoryList, ...arrParentCategorynull,] });
    } else {
      await  this.setState({
        pCategorysort: !this.state.pCategorysort,
        createdOnsort:true,
        createdBysort:true,
        modifiedOnsort:true,
        modifiedBysort:true,
        commoditysort: true,
        sort:true,
        emissionsort:true,
        categoryList: arrParentCategory.sort((a, b) =>
          a.parentCategory < b.parentCategory ? 1 : -1
        )
      });
      await this.setState({ categoryList: [...arrParentCategorynull,  ...this.state.categoryList ] });
    }
      break;
      case "CreatedOn":
        const arrCreatedOn = this.state.categoryList.filter(el => {
            return el.createdOn != null && el.createdOn != ''
           });
           const arrCreatedOnnull = this.state.categoryList.filter(el => {
            return el.createdOn === null 
           });
    if (this.state.createdOnsort) {
    await this.setState({
        createdOnsort: !this.state.createdOnsort,
        sort:true,
        createdBysort:true,
        modifiedOnsort:true,
        modifiedBysort:true,
        commoditysort: true,
        pCategorysort:true,
        emissionsort:true,
        categoryList: arrCreatedOn.sort((a, b) =>
          a.createdOn > b.createdOn ? 1 : -1
        )
      });
      await this.setState({ categoryList: [...this.state.categoryList, ...arrCreatedOnnull] });
    } else {
    await this.setState({
        createdOnsort: !this.state.createdOnsort,
        sort:true,
        createdBysort:true,
        modifiedOnsort:true,
        modifiedBysort:true,
        commoditysort: true,
        pCategorysort:true,
        emissionsort:true,
        categoryList: arrCreatedOn.sort((a, b) =>
          a.createdOn < b.createdOn ? 1 : -1
        )
      });
      await this.setState({ categoryList: [...arrCreatedOnnull,  ...this.state.categoryList ] });
    }
      break;
      case "ModifiedOn" :
        const arrModiDate = this.state.categoryList.filter(el => {
          return el.modifiedOn != null && el.modifiedOn != ''
         });
         const arrModiDatenull = this.state.categoryList.filter(el => {
          return el.modifiedOn === null 
         });
          if (this.state.modifiedOnsort) {
          await this.setState({
              modifiedOnsort: !this.state.modifiedOnsort,
              createdOnsort:true,
              createdBysort:true,
              sort:true,
              modifiedBysort:true,
              commoditysort: true,
              pCategorysort:true,
              emissionsort:true,
              categoryList: arrModiDate.sort((a, b) =>
                a.modifiedOn > b.modifiedOn ? 1 : -1
              )
            });
            await this.setState({ categoryList: [...this.state.categoryList, ...arrModiDatenull] });
          } else {
           await this.setState({
              modifiedOnsort: !this.state.modifiedOnsort,
              createdOnsort:true,
              createdBysort:true,
              sort:true,
              modifiedBysort:true,
              commoditysort: true,
              pCategorysort:true,
              emissionsort:true,
              categoryList: arrModiDate.sort((a, b) =>
                a.modifiedOn < b.modifiedOn ? 1 : -1
              )
            });
            await this.setState({ categoryList: [...arrModiDatenull,  ...this.state.categoryList ] });
          }
      break;
      case "CreatedBy":
        const arrCreatedBy = this.state.categoryList.filter(el => {
          return el.createdBy != null && el.createdBy != ''
         });
         const arrCreatedBynull = this.state.categoryList.filter(el => {
          return el.createdBy === null 
         });
        if (this.state.createdBysort) {
          await this.setState({
            createdBysort: !this.state.createdBysort,
            createdOnsort:true,
            sort:true,
            modifiedOnsort:true,
            modifiedBysort:true,
            commoditysort: true,
            pCategorysort:true,
            emissionsort:true,
            categoryList: arrCreatedBy.sort((a, b) =>
              a.createdBy > b.createdBy ? 1 : -1
            )
          });
        } else {
          await this.setState({
            createdBysort: !this.state.createdBysort,
            createdOnsort:true,
            sort:true,
            modifiedOnsort:true,
            modifiedBysort:true,
            commoditysort: true,
            pCategorysort:true,
            emissionsort:true,
            categoryList: arrCreatedBy.sort((a, b) =>
              a.createdBy < b.createdBy ? 1 : -1
            )
          });
          await this.setState({ categoryList: [...arrCreatedBynull,  ...this.state.categoryList ] });
        }
      break;
      case "ModifiedBy" :
        const arrModiBy = this.state.categoryList.filter(el => {
          return el.modifiedBy != null && el.modifiedBy != ''
         });
         const arrModiBynull = this.state.categoryList.filter(el => {
          return el.modifiedBy === null 
         });
        if (this.state.modifiedBysort) {
         await this.setState({
            modifiedBysort: !this.state.modifiedBysort,
            createdOnsort:true,
            createdBysort:true,
            modifiedOnsort:true,
            sort:true,
            commoditysort: true,
            pCategorysort:true,
            emissionsort:true,
            categoryList: arrModiBy.sort((a, b) =>
              a.modifiedBy > b.modifiedBy ? 1 : -1
            )
          });
          await this.setState({ categoryList: [ ...this.state.categoryList, ...arrModiBynull,] });
        } else {
        await this.setState({
            modifiedBysort: !this.state.modifiedBysort,
            createdOnsort:true,
            createdBysort:true,
            modifiedOnsort:true,
            sort:true,
            commoditysort: true,
            pCategorysort:true,
            emissionsort:true,
            categoryList: arrModiBy.sort((a, b) =>
              a.modifiedBy < b.modifiedBy ? 1 : -1
            )
          });
          await this.setState({ categoryList: [...arrModiBynull,  ...this.state.categoryList ] });
        }
      break; 
    }
  }
  async resetForm() {
    
    const updatedCategoryForm = {
      ...this.state.categoryForm
    };

    const categoryNameElement = {
      ...updatedCategoryForm["category"]
    };
    const parentCategoryElement = {
      ...updatedCategoryForm["parentcategory"]
    };
    const productClassificationNameElement = {
      ...updatedCategoryForm["commodity"]
    };
    // const categoryImageElement = {
    //     ...updatedCategoryForm['file']
    // };
    const EmissionElement = {
      ...updatedCategoryForm["Emission"]
    };
    const catImageElement = {
      ...updatedCategoryForm["CatImage"]
    };
    const catIconElement = {
      ...updatedCategoryForm["CatIcon"]
    };

    categoryNameElement.value = "";
    parentCategoryElement.value = "";
    productClassificationNameElement.value = "";
    //categoryImageElement.value = categoryImage;
    EmissionElement.value="";
    catImageElement.value="";
    catIconElement.value="";

    updatedCategoryForm["category"] = categoryNameElement;
    updatedCategoryForm["parentcategory"] = parentCategoryElement;
    updatedCategoryForm["commodity"] = productClassificationNameElement;
    //updatedCategoryForm['file'] = categoryImageElement;
    updatedCategoryForm["Emission"]=EmissionElement;
    updatedCategoryForm["CatImage"]=catImageElement;
    updatedCategoryForm["CatIcon"]=catIconElement;

    parentCategoryElement.elementConfig.disabled = true;
    this.setState({
      categoryForm: updatedCategoryForm,
      SubmitButton: "Add",
      CategoryGuid: null,
      CategoryImage: null,
      selectedFile: null,
      imageUploaded: false,
      selectedFileIcon: null,
      CategoryIcon: null,

    });
      localStorage.setItem('isRefreshed', true);
  }

  render() {
    let permissions = localStorage.permissions !== undefined? JSON.parse(localStorage.permissions):[];
        if(permissions.length === 0){
            return <Redirect to="/not-found" />;
        }else if(getUserPermision(permissions, PageKeys.categorymanagement) === null)
        {
            return <Redirect to="/not-found" />;
        }

    let defaultBannerUrl = getAWSUrl() + "CategoryImages/default.png";
    let formElementsArray = [];

    for (let key in this.state.categoryForm) {
      formElementsArray.push({
        id: key,
        config: this.state.categoryForm[key]
      });
    }
   
    let imagePreview = null;
    let imagePreviewIcon = null;
    if (this.state.CategoryImage !== null) {
      imagePreview =  getAWSUrl() + "CategoryImages/CategoryBannerImages/" +  this.state.CategoryImage
    } 
    else if (this.state.selectedFile !== null) {
      imagePreview = URL.createObjectURL(this.state.selectedFile)
    }
    if (this.state.CategoryIcon !== null) {
      imagePreviewIcon =  getAWSUrl() + "CategoryIcons/" + this.state.CategoryIcon
    } 
    else if (this.state.selectedFileIcon !== null){
      imagePreviewIcon = URL.createObjectURL(this.state.selectedFileIcon)
    }
    
    let categoryList = this.state.categoryList.map(item => (
      <React.Fragment>
        <tr>
          <td>
            <div className="cate_image">
              <img
                src={
                  item.categoryImage === null
                    ? defaultBannerUrl
                    : getAWSUrl() +
                    "CategoryImages/CategoryBannerImages/" +
                    item.categoryImage
                }
                onError={e => {
                  e.target.src = getAWSUrl() + "CategoryImages/default.png"; // some replacement image
                }}
              />
            </div>
          </td>
          <td>
            <p>{item.categoryName}</p>
          </td>
          <td>
            <p>{item.emission}</p>
          </td>
          <td>
            {/* <p>{item.categoryIcon}</p> */}
            <div className="cate_image">
              <img
                src={
                  item.categoryIcon === null
                    ? defaultBannerUrl
                    : getAWSUrl() +
                    "CategoryIcons/" +
                    item.categoryIcon
                }
                onError={e => {
                  e.target.src = getAWSUrl() + "CategoryImages/default.png"; // some replacement image
                }}
              />
            </div>
          </td>
          
          <td>
            <p>{item.productClassificationName}</p>
          </td>
          <td>
            <div>
              <p>{item.parentCategory}</p>
            </div>
          </td>
          <td>
            <p>{item.createdOn}</p>
          </td>
          <td>
            <p>{item.createdBy}</p>
          </td>
          <td>
            <p>{item.modifiedOn}</p>
          </td>
          <td>
            <p>{item.modifiedBy}</p>
          </td>
          <td>
            <div className="category_details3">
              {/* <div>
                            <Switch
                                checked={item.isActive}
                                onChange={() => this.ChangeCategoryStatus(item.categoryGuid, item.isActive, 'CHANGESTATUS')}
                                onColor="#86d3ff"
                                onHandleColor="#2693e6"
                                handleDiameter={15}
                                uncheckedIcon={false}
                                checkedIcon={false}
                                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                height={12}
                                width={30}
                                className="react-switch"
                            // id={data.userEmailTemplateNotificationGuid}
                            />
                        </div> */}
              <div>
                <Edit
                  onClick={event =>
                    this.editForm(
                      item.categoryName,
                      item.parentCategoryGuid,
                      item.productClassificationGuid,
                      item.categoryImage,
                      item.categoryGuid,
                      item.emission,
                      item.categoryIcon
                    )
                  }
                />
                {/* <Delete
                  data-tip
                  data-for="error2"
                  onClick={() =>
                    this.deleteCategoryConfirmation(
                      item.categoryGuid,
                      item.isActive,
                      "DELETECATEGORY",
                      item.categoryImage,
                      item.categoryIcon

                    )
                  }
                /> */}
              </div>
            </div>
          </td>
        </tr>
      </React.Fragment>
    ));

    return (
      <div className="CategoryManagement ">
        <div className="cm_outer">
          <div className="cm_header">
            <h6>
              <Sort />
              Add/Edit Category
            </h6>
          </div>
          <div className="category_form">
            <GridContainer>
              {formElementsArray.map(formElement => (
                <GridItem key={formElement.id} md={formElement.config.elementType === 'file' ? 6 : 3} xs={12}>
                  <div className="newThemeInput">
                    <Input
                      //onPaste={() => this.onPaste()}
                      // onKeyPress={(e) => this.enterkey(e)}
                      elementType={formElement.config.elementType}
                      elementConfig={formElement.config.elementConfig}
                      invalid={!formElement.config.valid}
                      shouldValidate={formElement.config.validation}
                      touched={formElement.config.touched}
                      errorMessage={formElement.config.errorMessage}
                      value={formElement.config.value}
                      changed={event => this.ChangeHandler(event, formElement.id)}
                      SelectChange={event =>
                        this.ChangeHandler(event, formElement.id)
                      }
                      label={formElement.config.label}
                      class={formElement.config.class}
                      fileLabel={formElement.config.fileLabel}
                      file={formElement.id==="CatIcon" ? imagePreviewIcon :imagePreview }
                      
                    />
                  </div>
                </GridItem>
              ))}

              {/* <GridItem md={4} xs={12}>
                                <label className="input_label">Category Image</label>
                                <div className="category_img_upload">
                                    <Input elementType="input" elementConfig={{ type: 'file' }} />
                                    <div className="">
                                        <div>
                                            <h5>Drag and drop <br /> your image here</h5>
                                            <p>(Image size is 10 MB and dimension 1250*350
                                            both configurable on global settings.)</p>
                                        </div>
                                        <div>
                                            <CloudUpload />
                                        </div>
                                    </div>
                                </div>
                            </GridItem> */}
              <GridItem md={4} xs={12}>
                <div className="">
                    <Button
                      outlineBtnNew
                      onClick={event => this.upsertCategory(event)}
                      disabled={this.state.loading === true ? true : false}
                    >
                      {this.state.SubmitButton}
                    </Button>
                    <Button solidBtnNew onClick={() => this.resetForm()}>
                      Reset
                    </Button>
                </div>
              </GridItem>
            </GridContainer>
          </div>
          <div className="category_list">
            <div>
              <hr />
              <GridContainer>
                <GridItem md={4}>
                  <div className="category_search">
                    <div className="newThemeInput">
                      <Input
                        elementType="input_2"
                        class="newInput_2"
                        label="Search"
                        changed={event => this.changeSearch(event)}
                        value={this.state.searchCategory}
                      />
                    </div>
                  </div>
                </GridItem>
                <GridItem md={8} xs={12}>
                  <Button
                    outlineBtnNew
                    onClick={() =>
                      this.getAllCategoryList(this.state.searchCategory)
                    }
                  >
                    Search
                  </Button>
                  <Button solidBtnNew onClick={() => this.resetSearch()}>
                    Clear
                  </Button>
                </GridItem>


              </GridContainer>
              <div className="border_top">
                <div class="cart_table_top_border" />
              </div>
              <div className="category_list_table">
              {this.state.loading == true ? (
                          <div style={{ display: "block" }}>
                            <Spinner />
                          </div>
                    ) :
                <table>
                  <thead>
                    <tr>
                      <th className="cate_img">Category Image</th>
                      <th onClick={() => this.sortCategoryManagement("CategoryName")}>
                        <div className="sort_category">
                          Category Name
                          {this.state.sort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortCategoryManagement("EmissionFactor")}>
                        <div className="sort_category">
                        Emission Factor
                          {this.state.emissionsort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th>Category Icon</th>
                      <th onClick={() => this.sortCategoryManagement("CommodityName")}>
                      <div className="sort_category">
                      Commodity Name
                        {this.state.commoditysort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                        </th>
                        <th onClick={() => this.sortCategoryManagement("ParentCategory")}>
                      <div className="sort_category">
                      Parent Category
                        {this.state.pCategorysort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                        </th>
                      <th onClick={() => this.sortCategoryManagement("CreatedOn")}>
                      <div className="sort_category">
                      Created On
                        {this.state.createdOnsort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                        </th>
                        <th onClick={() => this.sortCategoryManagement("CreatedBy")}>
                      <div className="sort_category">
                      Created By
                        {this.state.createdBysort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                        </th>
                        <th onClick={() => this.sortCategoryManagement("ModifiedOn")}>
                      <div className="sort_category">
                      Modified On
                        {this.state.modifiedOnsort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                        </th>
                        <th onClick={() => this.sortCategoryManagement("ModifiedBy")}>
                      <div className="sort_category">
                      Modified By
                        {this.state.modifiedBysort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                        </th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    { categoryList.length > 0 ? (
                      categoryList
                    ) : (
                      <tr>
                        <td colSpan="6">
                          <div>No Result Found</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                 }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default CategoryManagement;