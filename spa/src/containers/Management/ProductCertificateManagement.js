import Delete from "@material-ui/icons/DeleteForever";
import Edit from "@material-ui/icons/Edit";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Sort from "@material-ui/icons/Sort";
import axios from "axios";
import React, { Component } from "react";
import { confirmAlert } from "react-confirm-alert";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { getServiceUrl, getWebsiteGUID,getAWSUrl,getWebsiteUrl } from "../../config";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import { getAllProdCertificateList } from "../../utility";
import Spinner from "../../UI/Spinner/Spinner";
import moment from "moment";
const awsUrl = getWebsiteUrl();
const initialState = {
  productCertificateForm: {
    productCertificateName: {
      elementType: "input_2",
      class: "newInput_2",
      elementConfig: {
        type: "text",
      },
      value: "",
      validation: {
        required: true,
        maxLength: 50
      },
      valid: true,
      touched: false,
      formControlProps: { fullWidth: true },
      label: "Product Certification *"
    },
    blank: {
      elementType: "",
    },
    productCertificateIcon: {
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
      errorMessage: "Please select a .svg file.",
      valid: false,
      touched: false,
      fileLabel:'Product Certification icon'
    },
  },
  isValid: false,
 // errorMessage: "",
  loading: false,
  SubmitButton: "Add",
  prodCertificateList: [],
  productCertificateGuid: null,
  productCertificateIcon:null,
  searchProdCertificate: "",
  alphaNumericOnly: true,
  paste: false,
  selectedFileIcon:null,
  imageUploadError: null,
  prodCertNamesort: true,
  prodCertModiDatesort: true,
  prodCertCreDatesort: true,
  prodCertCreBysort: true,
  prodCertModiBysort: true,
};

class ProductCertificateManagement extends Component {
  state = { ...initialState }; // use spread operator to avoid mutation

  constructor(props) {
    super(props);
  }
  handleChange(checked) {
    this.setState({ checked });
  }
  async componentDidMount() {
    this.getAllProdCertificateList("");
  }
  changeSearch(event) {
    this.setState({ searchProdCertificate: event.target.value });
  }
  resetSearch() {
    this.getAllProdCertificateList("");
    this.setState({ searchProdCertificate: "" });
  }


  getAllProdCertificateList(searchProdCertificate) {
    this.setState({
      loading: true
    });
    getAllProdCertificateList(searchProdCertificate)
      .then(
        prodCertificateList => {
        this.setState({
          prodCertificateList: prodCertificateList,
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
  
  async sortProductCertification(ColumnName){
    switch(ColumnName){
      case"Name":
      if (this.state.prodCertNamesort) {
       this.setState({
        prodCertNamesort: !this.state.prodCertNamesort,
        prodCertificateList: this.state.prodCertificateList.sort((a, b) =>
          a.productCertificateName.toString().toLowerCase() > b.productCertificateName.toString().toLowerCase() ? 1 : -1
          )
        });
      } else {
       this.setState({
        prodCertNamesort: !this.state.prodCertNamesort,
        prodCertificateList: this.state.prodCertificateList.sort((a, b) =>
           a.productCertificateName.toString().toLowerCase() < b.productCertificateName.toString().toLowerCase() ? 1 : -1
          )
        });
      }
      break;
      case "CreatedOn":
      if (this.state.prodCertCreDatesort) {
        await this.setState({
          prodCertCreDatesort: !this.state.prodCertCreDatesort,
          prodCertificateList: this.state.prodCertificateList.sort((a, b) =>
            a.createdDate > b.createdDate ? 1 : -1
          )
        });
      } else {
        await this.setState({
          prodCertCreDatesort: !this.state.prodCertCreDatesort,
          prodCertificateList: this.state.prodCertificateList.sort((a, b) =>
            a.createdDate < b.createdDate ? 1 : -1
          )
        });
      }
      break;
      case "ModifiedOn" :
        const arrModiDate = this.state.prodCertificateList.filter(el => {
          return el.modifiedDate != null && el.modifiedDate != ''
         });
         const arrModiDatenull = this.state.prodCertificateList.filter(el => {
          return el.modifiedDate === null 
         });
        
        if (this.state.prodCertModiDatesort) {
         await this.setState({
          prodCertModiDatesort: !this.state.prodCertModiDatesort,
            prodCertificateList: arrModiDate.sort((a, b) =>
              a.modifiedDate > b.modifiedDate ? 1 : -1
            )
          });
          await this.setState({ prodCertificateList: [...this.state.prodCertificateList, ...arrModiDatenull] });
        } else {
          await this.setState({
            prodCertModiDatesort: !this.state.prodCertModiDatesort,
            prodCertificateList: arrModiDate.sort((a, b) =>
              a.modifiedDate < b.modifiedDate ? 1 : -1
            )
          });
          await this.setState({ prodCertificateList: [...arrModiDatenull, ...this.state.prodCertificateList] });
      }
      break;
      case "CreatedBy":
          if (this.state.prodCertCreBysort) {
            await this.setState({
              prodCertCreBysort: !this.state.prodCertCreBysort,
              prodCertificateList: this.state.prodCertificateList.sort((a, b) =>
                a.createdBy > b.createdBy ? 1 : -1
              )
            });
          } else {
            await this.setState({
              prodCertCreBysort: !this.state.prodCertCreBysort,
              prodCertificateList: this.state.prodCertificateList.sort((a, b) =>
                a.createdBy < b.createdBy ? 1 : -1
              )
            });
      } 
      break;
      case "ModifiedBy" :
            const arrModiby = this.state.prodCertificateList.filter(el => {
              return el.modifiedBy != null && el.modifiedBy != ''
             });
             const arrModibynull = this.state.prodCertificateList.filter(el => {
              return el.modifiedBy === null 
             });
            if (this.state.prodCertModiBysort) {
            await this.setState({
              prodCertModiBysort: !this.state.prodCertModiBysort,
                prodCertificateList: arrModiby.sort((a, b) =>
                  a.modifiedBy > b.modifiedBy ? 1 : -1
                )
              });
              await this.setState({ prodCertificateList: [...this.state.prodCertificateList, ...arrModibynull] });
            } else {
              await this.setState({
                prodCertModiBysort: !this.state.prodCertModiBysort,
                prodCertificateList: arrModiby.sort((a, b) =>
                  a.modifiedBy < b.modifiedBy ? 1 : -1
                )
              });
              await this.setState({ prodCertificateList: [...arrModibynull, ...this.state.prodCertificateList] });
      }
      break; 
    }
  
  }

  enterkey = e => {
    this.setState({ paste: false });
    var keyCode = e.keyCode || e.which;
    var regex = /[/[a-zA-Z &]+$/;
    var isValid = regex.test(String.fromCharCode(keyCode));
    this.setState({ alphaNumericOnly: isValid });
  };

  onPaste = () => {
    this.setState({ paste: true });
  };
  async uploadImage() {
    var regex = new RegExp("([a-zA-Z0-9s_\\.-:])+(.svg)$");
    if (regex.test(this.state.selectedFileIcon.name.toLowerCase())) {
      const formData = new FormData();

      formData.append(
        "files",
        this.state.selectedFileIcon,
        this.state.selectedFileIcon.name
      );
      var config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "multipart/form-data",
          UploadType: "ProductCertificationIcon"
        }
      };
      // await axios
      //   .post(getServiceUrl() + "FileUpload/uploadfile", formData, config)
      //   .then(response => {
      //     if (response.data.indexOf("dimensions") === -1) {
      //       this.setState({
      //         productCertificateIcon: response.data,
      //         imageUploadError: null,
      //         imageUploaded: true
      //       });
      //     } else {
      //       this.setState({ imageUploadError: response.data, imageUploaded: false });
      //     }
      //   });
    } else {
      this.setState({ imageUploadError: "Please select a valid Image file." });
    }
  }
  validateForm() {
    if (this.state.productCertificateForm.productCertificateName.value === "") {
      this.setState({
        isValid: false,
        errorMessage: "Product certficate name is mandatory"
      });
    } else {
      this.setState({ isValid: true });
    }
  }
  async upsertProduct(event) {
    this.setState({ loading: true });
    event.preventDefault();
    const updatedproductCertificateForm = {
      ...this.state.productCertificateForm
    };
    await this.validateForm();
    if (this.state.isValid) {
      if (this.state.selectedFileIcon !== null) {
        await this.uploadImage();
      }
      if(this.state.imageUploadError === null){
      const formData = {
        ProductCertificateGuid: this.state.productCertificateGuid === null || this.state.productCertificateGuid === undefined || this.state.productCertificateGuid === "" || this.state.productCertificateGuid === "null" ? "00000000-0000-0000-0000-000000000000" : this.state.productCertificateGuid ,
        ProductCertificateName: updatedproductCertificateForm.productCertificateName.value,
        LanguageGuid: localStorage.getItem("languageId"),
        IsActive: 1,
        CreatedBy: localStorage.getItem("userId"),
        ModifiedBy: localStorage.getItem("userId"),
        WebsiteGuid: getWebsiteGUID(),
        IconName:this.state.productCertificateIcon
      };
      var config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "application/json"
        }
      };
      await axios.post(getServiceUrl() + "MasterData/InsertOrUpdateProductCertificate", formData, config)
        .then(response => {
          this.getAllProdCertificateList("");
          this.resetForm();
          this.setState({ loading: false });
          confirmAlert({
            message: response.data,
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

  async deleteProductConfirmation(productCertificateGuid,iconName) {
    
    confirmAlert({
      message: "Are you sure?",
      buttons: [
        {
          label: "Yes",
          onClick: () => this.deleteProductCertificate(productCertificateGuid,iconName)
        },
        {
          label: "No"
        }
      ]
    });
  }

  async deleteProductCertificate(productCertificateGuid,iconName) {
    
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        "ProductCertificateGuid":productCertificateGuid,
        "IconName":iconName,
      }
    };
    
    await axios.get(getServiceUrl() + "MasterData/DeleteProductCertificate", config
      )
      .then(response => {
        this.getAllProdCertificateList("");
        confirmAlert({
          message: response.data=='True' ? "Data deleted successfully":response.data,
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

  ChangeHandler = (event, inputIdentifier) => {
    const updatedProductCertificateForm = {
      ...this.state.productCertificateForm
    };

    const updatedFormElement = {
      ...updatedProductCertificateForm[inputIdentifier]
    };

    updatedFormElement.value = event.target.value;

    updatedProductCertificateForm[inputIdentifier] = updatedFormElement;
    if(inputIdentifier === "productCertificateName"){
    if (!this.state.paste) {
      if (this.state.alphaNumericOnly) {
        if (
          event.target.value.length <= updatedFormElement.validation.maxLength
        ) {
          this.setState({
            productCertificateForm: updatedProductCertificateForm,
           // newValues: updatedProductCertificateForm
          });
        }
      }
    }
    }
    
    if (inputIdentifier === "productCertificateIcon") {
        var regex = new RegExp("([a-zA-Z0-9s_\\.-:])+(.svg)$");
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
            selectedFileIcon: null,
            productCertificateIcon: null
          });
        } else {
          this.setState({
            productCertificateForm: updatedProductCertificateForm,
            selectedFileIcon:
              event.target.files !== undefined ? event.target.files[0] : null,
              productCertificateIcon:
              event.target.files !== undefined ? null : this.state.productCertificateIcon
          });
          
          
        }
      }
  };

  editForm = (productCertificateName, iconName, productCertificateGuid) => {
    document.documentElement.scrollTop = 0;
    const updatedProdCertForm = {
      ...this.state.productCertificateForm
    };

    const prodcertificationElement = {
      ...updatedProdCertForm["productCertificateName"]
    };

    prodcertificationElement.value = productCertificateName;

    updatedProdCertForm["productCertificateName"] = prodcertificationElement;

    this.setState({
      productCertificateForm: updatedProdCertForm,
      SubmitButton: "Update",
      productCertificateGuid: productCertificateGuid,
      productCertificateIcon: iconName
    });
  };
  resetForm() {
    const updatedproductCertificateForm = {
      ...this.state.productCertificateForm
    };

    const productCertificateElement = {
      ...updatedproductCertificateForm["productCertificateName"]
    };

    productCertificateElement.value = "";

    updatedproductCertificateForm["productCertificateName"] = productCertificateElement;

    this.setState({
      productCertificateForm: updatedproductCertificateForm,
      SubmitButton: "Add",
      productCertificateGuid: null,
      productCertificateIcon: null,
      selectedFileIcon: null
    });
  }
  render() {
    let defaultBannerUrl = getAWSUrl() + "CategoryImages/default.png";
    let formElementsArray = [];
    for (let key in this.state.productCertificateForm) {
      formElementsArray.push({
        id: key,
        config: this.state.productCertificateForm[key]
      });
    }
    let imagePreview = null;
    if (this.state.productCertificateIcon !== null) {
      imagePreview =  getAWSUrl() + "ProductCertificationIcons/" + this.state.productCertificateIcon
     } 
   else if (this.state.selectedFileIcon !== null) {
      imagePreview = URL.createObjectURL(this.state.selectedFileIcon)
    }
    
    let prodCertificateList = this.state.prodCertificateList.map(item => (
      <React.Fragment>
        <tr>
          <td>
            <p>{item.productCertificateName}</p>
          </td>
          <td>
            {/* <p>{item.productCertificateFullName}</p> */}
           
            <div className="cate_image">
              <img
                src={ 
                  item.iconName === null
                    ? defaultBannerUrl
                    : getAWSUrl() +
                    "ProductCertificationIcons/" +
                    item.iconName
                 
                }
                onError={e => {
                  e.target.src = getAWSUrl() + "CategoryImages/default.png"; // some replacement image
                }}
              />
            </div>
          </td>
          <td>
            {/* <p>{item.createdDate}</p> */}
            <p>{item.createdDate !=null ?  moment(item.createdDate).format("DD/MM/YYYY") : "" }</p>
          </td>
          <td>
            <p>{item.createdBy}</p>
          </td>
          <td>
            {/* <p>{item.modifiedDate}</p> */}
            <p>{item.modifiedDate !=null ?  moment(item.modifiedDate).format("DD/MM/YYYY") : "" }</p>
          </td>
          <td>
            <p>{item.modifiedBy}</p>
          </td>
          <td>
            <div className="category_details3">
              <div>
                <Edit
                  onClick={event =>
                    this.editForm(
                      item.productCertificateName,
                      item.iconName,
                      item.productCertificateGuid
                    )
                  }
                />
                <Delete
                  data-tip
                  data-for="error2"
                  onClick={() =>
                    this.deleteProductConfirmation(
                      item.productCertificateGuid,
                      item.iconName
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
      <div className="CategoryManagement CommodityManag ">
        <div className="cm_outer">
          <div className="cm_header">
            <h6>
              <Sort />
              Add/Edit product certficate
            </h6>
          </div>
          <div className="category_form">
            <GridContainer>
              {formElementsArray.map(formElement => (
                <GridItem key={formElement.id} md={formElement.config.elementType === 'file' ? 6 : 4} xs={12}>
                  {formElement.config.elementType === '' ? '' : <div className="newThemeInput">
                    <Input
                      onPaste={() => this.onPaste()}
                      onKeyPress={e => this.enterkey(e)}
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
                      checkBoxLabel={formElement.config.checkBoxLabel}
                      file={imagePreview}
                    />
                  </div>}
                </GridItem>
              ))}
              <GridItem md={4} xs={12}>
                <div className="management_actions">
                  <Button
                    outlineBtnNew
                    onClick={event => this.upsertProduct(event)}
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
                        value={this.state.searchProdCertificate}
                      />
                    </div>
                  </div>
                </GridItem>
                <GridItem md={8} xs={12}>
                  <div>
                    <Button
                      outlineBtnNew
                      onClick={() =>
                        this.getAllProdCertificateList(this.state.searchProdCertificate)
                      }
                    >
                      Search
                    </Button>
                    <Button solidBtnNew onClick={() => this.resetSearch()}>
                      Clear
                    </Button>
                  </div>
                </GridItem>
              </GridContainer>
              <div className="border_top">
                <div class="cart_table_top_border" />
              </div>
              <div className="category_list_table">
                {/* <div class="cart_table_top_border"></div> */}
                <table>
                  <thead>
                    <tr>
                      <th onClick={() => this.sortProductCertification("Name")}>
                        <div className="sort_category">
                          Product Certficate Name
                          {this.state.prodCertNamesort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th>Icon Name</th>
                      <th onClick={() => this.sortProductCertification("CreatedOn")}>
                        <div className="sort_category">
                        Created On
                          {this.state.prodCertCreDatesort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortProductCertification("CreatedBy")}>
                        <div className="sort_category">
                        Created By
                          {this.state.prodCertCreBysort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortProductCertification("ModifiedOn")}>
                        <div className="sort_category">
                        Modified On
                          {this.state.prodCertModiDatesort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortProductCertification("ModifiedBy")}>
                        <div className="sort_category">
                        Modified By
                          {this.state.prodCertModiBysort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.loading == true ? (
                      <tr>
                        <td colSpan="6">
                          <div style={{ display: "block" }}>
                            <Spinner />
                          </div>
                        </td>
                      </tr>
                    ) : prodCertificateList.length > 0 ? (
                      prodCertificateList
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
export default ProductCertificateManagement;