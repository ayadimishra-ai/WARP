import React, { Component } from "react";
import Input from "../../UI/Input/MaterialInput";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import Button from "../../UI/Button/MaterialButton";
import Sort from "@material-ui/icons/Sort";
import Edit from "@material-ui/icons/Edit";
import Delete from "@material-ui/icons/DeleteForever";
import ExpandMore from "@material-ui/icons/ExpandMore";
import ExpandLess from "@material-ui/icons/ExpandLess";
import {
  getParentCategoryList,
  getCommodityList,
  getAllCategoryList
} from "../../utility";
import axios from "axios";
import {
  getWebsiteGUID,
  getServiceUrl,
  getAWSUrl,
  getGlobalSettings,
  getUserPermision
} from "../../config";
import { confirmAlert } from "react-confirm-alert";
import Spinner from "../../UI/Spinner/Spinner";
import { Redirect } from "react-router-dom";
import * as PageKeys from "../../pagekeys";

//import elasticsearch from 'elasticsearch';
//import connectionClass from 'http-aws-es';
//import AWS from 'aws-sdk';

const initialState = {
  categoryForm: {
    category: {
      elementType: "input",
      elementConfig: {
        type: "text",
        placeholder: "Category"
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
      elementType: "select",
      elementConfig: {
        type: "select",
        options: [],
        value: 0
      },
      label: "Select Commodity *",
      validation: {
        required: true
      },
      errorMessage: "Please select a commodity.",
      valid: false,
      touched: false
    },
    parentcategory: {
      elementType: "select",
      elementConfig: {
        type: "select",
        options: [],
        value: "0",
        disabled: true
      },
      validation: {
        required: false
      },
      label: "Parent Category"
    },
    file: {
      elementType: "file",
      elementConfig: {
        type: "file",
        height: 0,
        width: 0,
        size: 0
      },
      validation: {
        required: false
      },
      errorMessage: "Please select a .png file.",
      valid: false,
      touched: false
    }
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
  //paste: false,
  sort: true
};

class CategoryManagement extends Component {
  state = { ...initialState }; // use spread operator to avoid mutation

  constructor(props) {
    super(props);
    this.changeSearch = this.changeSearch.bind(this);
    this.getAllCategoryList = this.getAllCategoryList.bind(this);
  }

  sortCategory() {
    if (this.state.sort) {
      this.setState({
        sort: !this.state.sort,
        categoryList: this.state.categoryList.sort((a, b) =>
          a.categoryName > b.categoryName ? 1 : -1
        )
      });
    } else {
      this.setState({
        sort: !this.state.sort,
        categoryList: this.state.categoryList.sort((a, b) =>
          a.categoryName < b.categoryName ? 1 : -1
        )
      });
    }
  }
  handleChange(checked) {
    this.setState({ checked });
  }
  imageValidationText() {
    const updatedCategoryForm = {
      ...this.state.categoryForm
    };

    const productFileElement = {
      ...updatedCategoryForm["file"]
    };

    getGlobalSettings("CATEGORYBANNERIMAGEHEIGHT").then(function (result) {
      if (result.data.hits.hits.length !== 0) {
        productFileElement.elementConfig.height =
          result.data.hits.hits[0]._source.settingsValue;
      }
    });
    getGlobalSettings("CATEGORYBANNERIMAGEWIDTH").then(function (result) {
      if (result.data.hits.hits.length !== 0) {
        productFileElement.elementConfig.width =
          result.data.hits.hits[0]._source.settingsValue;
      }
    });
    getGlobalSettings("CATEGORYBANNERIMAGESIZE").then(function (result) {
      if (result.data.hits.hits.length !== 0) {
        productFileElement.elementConfig.size =
          result.data.hits.hits[0]._source.settingsValue;
      }
    });

    updatedCategoryForm["file"] = productFileElement;
    this.setState({
      categoryForm: updatedCategoryForm
    });
  }

  async componentDidMount() {
    await this.imageValidationText();
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
    parentCategoryElement.value = 0;
    productClassificationNameElement.value = 0;

    updatedCategoryForm["parentcategory"] = parentCategoryElement;
    updatedCategoryForm["commodity"] = productClassificationNameElement;
    this.setState({
      categoryForm: updatedCategoryForm,
      SubmitButton: "Add",
      CategoryGuid: null,
      CategoryImage: null,
      selectedFile: null
    });
  }
  resetSearch() {
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
  async checkValidation(categoryName, commodityGuid) {
    let isValid = true;
    let errorMessage = "";
    if (
      categoryName === null ||
      categoryName === undefined ||
      categoryName === ""
    ) {
      isValid = false;
      errorMessage = "Category is mandatory";
    } else if (
      commodityGuid === null ||
      commodityGuid === undefined ||
      commodityGuid === 0
    ) {
      isValid = false;
      errorMessage = "Commodity is mandatory";
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
      updatedCategoryForm.commodity.value
    );
    if (this.state.isValid) {
      if (this.state.selectedFile !== null) {
        await this.uploadImage();
      }

      if (this.state.imageUploadError === null) {
        const formData = {
          CategoryGuid: this.state.CategoryGuid,
          CategoryName: updatedCategoryForm.category.value,
          LanguageGuid: localStorage.getItem("languageId"),
          ParentCategoryGuid: updatedCategoryForm.parentcategory.value,
          CommodityGuid: updatedCategoryForm.commodity.value,
          CategoryImage: this.state.selectedFileName,
          IsActive: 1,
          WebsiteGuid: getWebsiteGUID(),
          UserGuid: localStorage.getItem("userId"),
          Action: this.state.SubmitButton.toUpperCase(),
          OldValuesXML: JSON.stringify(this.state.oldValues),
          NewValuesXML: JSON.stringify(this.state.newValues),
          PageName: window.location.href
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
            this.getAllCategoryList("");
            this.setState({ loading: false });
            let message = response.data.table1[0].column1
            if (this.state.SubmitButton.toUpperCase() === 'UPDATE') {
              message = response.data.table1[0].column1.concat(this.state.imageUploaded ? " Banner uploaded successfully" : "");
            }
            this.resetForm();
            confirmAlert({
              message: message,
              buttons: [
                {
                  label: "OK"
                }
              ]
            });

            //   var configIntegration = {
            //     headers: {
            //         "Authorization": "Bearer " + localStorage.tokenId,
            //         'Content-Type': 'application/json',                                
            //         'ProductGuid': this.props.ProductGuid                                
            //     },
            // };

          // axios.post(getServiceUrl() + 'Integration/ProductCategoryCPanel?', formData, configIntegration)
          // .then((response) => {
          //     if (response.data.result === "Success") {
          //         // confirmAlert({
          //         //     message: response.data.result,
          //         //     buttons: [
          //         //         {
          //         //             label: 'Success',
          //         //         }
          //         //     ]
          //         // });
          //     }
          //     else{
          //         // confirmAlert({
          //         //     message: response.data.result,
          //         //     buttons: [
          //         //         {
          //         //             label: 'Error While syncing data with CPanel',
          //         //         }
          //         //     ]
          //         // });
          //     }

          // }).catch(err => err.response !== undefined ?  err.response.status === 401 ? window.location.pathname='/supplierlogin' : '' : '');

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
      }
    } else {
      this.setState({ loading: false });
      confirmAlert({
        message: this.state.errorMessage,
        buttons: [
          {
            label: "OK"
          }
        ]
      });
    }
  }

  async deleteCategoryConfirmation(categoryGuid, isActive, action) {
    confirmAlert({
      message: "Are you sure?",
      buttons: [
        {
          label: "Yes",
          onClick: () => this.deleteCategory(categoryGuid, isActive, action)
        },
        {
          label: "No"
        }
      ]
    });
  }

  async deleteCategory(categoryGuid, isActive, action) {
    const formData = {
      CategoryGuid: categoryGuid,
      IsActive: !isActive,
      UserGuid: localStorage.getItem("userId"),
      Action: action.toUpperCase(),
      OldValuesXML: categoryGuid,
      NewValuesXML: "Deleted",
      PageName: window.location.href
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
    // await this.checkValidation(updatedCategoryForm.category.value, updatedCategoryForm.commodity.value);
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
  // enterkey = (e) => {
  //     this.setState({ paste: false })
  //     var keyCode = e.keyCode || e.which;
  //     //Regex for Valid Characters i.e. Alphabets and Numbers.
  //     var regex = /[/[a-zA-Z &]+$/;

  //     //Validate TextBox value against the Regex.
  //     var isValid = regex.test(String.fromCharCode(keyCode));
  //     this.setState({ alphaNumericOnly: isValid })
  // }

  // onPaste = () => {
  //     this.setState({ paste: true })
  // }
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
      await this.parentCategoryList(event.target.value);
      updatedCategoryForm["parentcategory"].elementConfig.disabled = false;
    }
    if (inputIdentifier === "file") {
      var regex = new RegExp("([a-zA-Z0-9s_\\.-:])+(.jpg|.png|.gif)$");
      if (!regex.test(event.target.files[0].name.toLowerCase())) {
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
      }
    } else if (inputIdentifier === "category") {
      //if (!this.state.paste) {
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
      //}
    } else {
      this.setState({
        categoryForm: updatedCategoryForm,
        newValues: updatedCategoryForm
      });
    }
  }

  async editForm(
    categoryName,
    parentCategoryGuid,
    productClassificationGuid,
    categoryImage,
    categoryGuid
  ) {
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
    // const categoryImageElement = {
    //     ...updatedCategoryForm['file']
    // };

    categoryNameElement.value = categoryName;
    parentCategoryElement.value = parentCategoryGuid;
    parentCategoryElement.elementConfig.disabled = false;
    productClassificationNameElement.value = productClassificationGuid;
    //categoryImageElement.value = categoryImage;
    await this.parentCategoryList(productClassificationNameElement.value);
    updatedCategoryForm["category"] = categoryNameElement;
    updatedCategoryForm["parentcategory"] = parentCategoryElement;
    updatedCategoryForm["commodity"] = productClassificationNameElement;
    //updatedCategoryForm['file'] = categoryImageElement;

    this.setState({
      categoryForm: updatedCategoryForm,
      oldValues: updatedCategoryForm,
      SubmitButton: "Update",
      CategoryGuid: categoryGuid,
      CategoryImage: categoryImage
    });
    //alert(productClassificationNameElement.value)
  }
  resetForm() {
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

    categoryNameElement.value = "";
    parentCategoryElement.value = 0;
    productClassificationNameElement.value = 0;
    //categoryImageElement.value = categoryImage;

    updatedCategoryForm["category"] = categoryNameElement;
    updatedCategoryForm["parentcategory"] = parentCategoryElement;
    updatedCategoryForm["commodity"] = productClassificationNameElement;
    //updatedCategoryForm['file'] = categoryImageElement;
    parentCategoryElement.elementConfig.disabled = true;
    this.setState({
      categoryForm: updatedCategoryForm,
      SubmitButton: "Add",
      CategoryGuid: null,
      CategoryImage: null,
      selectedFile: null,
      imageUploaded: false
    });
  }
  async uploadImage() {
    var regex = new RegExp("([a-zA-Z0-9s_\\.-:])+(.jpg|.png|.gif)$");
    if (regex.test(this.state.selectedFile.name.toLowerCase())) {
      const formData = new FormData();

      formData.append(
        "files",
        this.state.selectedFile,
        this.state.selectedFile.name
      );
      var config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "multipart/form-data",
          UploadType: "CategoryImage"
        }
      };
      await axios
        .post(getServiceUrl() + "FileUpload/uploadfile", formData, config)
        .then(response => {
          if (response.data.indexOf("dimensions") === -1) {
            this.setState({
              selectedFileName: response.data,
              imageUploadError: null,
              imageUploaded: true
            });
          } else {
            this.setState({ imageUploadError: response.data, imageUploaded: false });
          }
          //document.getElementById("fie-upload-message").innerHTML = 'Drag your files here or click in this area.';
        });
    } else {
      this.setState({ imageUploadError: "Please select a valid Image file." });
    }
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
    if (this.state.CategoryImage !== null) {
      imagePreview = (
        <img
          alt=" "
          src={
            getAWSUrl() +
            "CategoryImages/CategoryBannerImages/" +
            this.state.CategoryImage
          }
        />
      );
    } else if (this.state.selectedFile !== null) {
      imagePreview = (
        <img alt=" " src={URL.createObjectURL(this.state.selectedFile)} />
      );
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
                      item.categoryGuid
                    )
                  }
                />
                <Delete
                  data-tip
                  data-for="error2"
                  onClick={() =>
                    this.deleteCategoryConfirmation(
                      item.categoryGuid,
                      item.isActive,
                      "DELETECATEGORY"
                    )
                  }
                />
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
                <GridItem key={formElement.id} md={4} xs={12}>
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
                  />
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
              <GridItem md={8} xs={12}>
                <div className="cate_actions">
                  <div className="cate_image">{imagePreview}</div>
                  <div>
                    <Button
                      greenSubmit
                      onClick={event => this.upsertCategory(event)}
                      disabled={this.state.loading === true ? true : false}
                    >
                      {this.state.SubmitButton}
                    </Button>
                    <Button simple onClick={() => this.resetForm()}>
                      RESET
                    </Button>
                  </div>
                </div>
              </GridItem>
            </GridContainer>
          </div>
          <div className="category_list">
            <div>
              <hr />
              <GridContainer>
                <GridItem md={12}>
                  <div className="category_search">
                    <Input
                      elementType="input"
                      label="Search"
                      changed={event => this.changeSearch(event)}
                      value={this.state.searchCategory}
                    />
                    <Button
                      greenSubmit
                      onClick={() =>
                        this.getAllCategoryList(this.state.searchCategory)
                      }
                    >
                      Search
                    </Button>
                    <Button simple onClick={() => this.resetSearch()}>
                      Clear
                    </Button>
                  </div>
                </GridItem>
              </GridContainer>
              <div className="border_top">
                <div class="cart_table_top_border" />
              </div>
              <div className="category_list_table">
                <table>
                  <thead>
                    <tr>
                      <th className="cate_img">Category Image</th>
                      <th onClick={() => this.sortCategory()}>
                        <div className="sort_category">
                          Category Name
                          {this.state.sort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th>Commodity</th>
                      <th>Parent Category</th>
                      <th>Created On</th>
                      <th>Created By</th>
                      <th>Modified On</th>
                      <th>Modified By</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.loading == true ? (
                      <tr>
                        <td colSpan="8">
                          <div style={{ display: "block" }}>
                            <Spinner />
                          </div>
                        </td>
                      </tr>
                    ) : categoryList.length > 0 ? (
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
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default CategoryManagement;
