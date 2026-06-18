import Delete from "@material-ui/icons/DeleteForever";
import Edit from "@material-ui/icons/Edit";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Sort from "@material-ui/icons/Sort";
import axios from "axios";
import moment from "moment";
import React, { Component } from "react";
import { confirmAlert } from "react-confirm-alert";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { getServiceUrl } from "../../config";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from "../../UI/Spinner/Spinner";

const initialState = {
  productForm: {
    productgroup: {
      elementType: "input_2",
      class: "newInput_2",
      elementConfig: {
        type: "text",
        // placeholder: "Commodity"
      },
      value: "",
      validation: {
        required: true,
        maxLength: 50
      },
      valid: true,
      touched: false,
      formControlProps: { fullWidth: true },
      label: "Product group *"
    },
    Displayorder: {
      elementType: "input_2",
      class: "newInput_2",
      elementConfig: {
        type: "text",
        // placeholder: "Category"
      },
      value:0,
      validation: {
        required: true,
        alphaNumericOnly: true,
        maxLength: 50
      },
      requiredclass: "required",
      valid:true,
      touched: false,
      formControlProps: { fullWidth: true },
      label: "Display order *"
    },
   
  },
  isValid: false,
  errorMessage: "",
  loading: false,
  SubmitButton: "Add",
  productList: [],
  productGuid: null,
  searchProduct: "",
  alphaNumericOnly: true,
  paste: false,
  GroupNamesort: true,
  DisplayOrdersort: true,
  GroupModiDatesort: true,
  GroupCreDatesort: true,
  GroupCreBysort: true,
  GroupModiBysort: true,
};

class ProductGroupnameManagement extends Component {
  state = { ...initialState }; // use spread operator to avoid mutation

  constructor(props) {
    super(props);
  }
  handleChange(checked) {
    this.setState({ checked });
  }
  async componentDidMount() {
   
    this.getProductGroupList("");
  }
  changeSearch(event) {
    this.setState({ searchProduct: event.target.value });
  }
 async resetSearch() {
    await this.setState({ searchProduct: "" });
    await this.getProductGroupList("");
    
  }

   async getProductGroupList() {

    let list = null;
    var config = {
        headers: {
            'Authorization': 'Bearer ' + localStorage.tokenId,
            'Content-Type': 'application/json',
            'GroupName': this.state.searchProduct
        },
    };
    await axios.get(getServiceUrl() + 'masterdata/GetProductGroup', config)
        .then((json) => {
          this.setState({
            productList: json.data,
            loading: false
          });
            list = JSON.stringify(json.data)
        }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
    
}

  enterkey = e => {
    this.setState({ paste: false });
    var keyCode = e.keyCode || e.which;
    //Regex for Valid Characters i.e. Alphabets and Numbers.
    var regex = /[/[a-zA-Z &]+$/;

    //Validate TextBox value against the Regex.
    var isValid = regex.test(String.fromCharCode(keyCode));
    this.setState({ alphaNumericOnly: isValid });

    if(isNaN(e.keyCode))
    {
      this.setState({ alphaNumericOnly: false });
    }
    else{this.setState({ alphaNumericOnly: true });}
  };
  onPaste = () => {
    this.setState({ paste: true });
  };
  validateForm() {
    if (this.state.productForm.productgroup.value.trim() === "") {
      this.setState({
        isValid: false,
        errorMessage: "Product groupname is mandatory"
      });
    } 
    else if (this.state.productForm.Displayorder.value === "" || this.state.productForm.Displayorder.value === "0" )  {
      this.setState({
        isValid: false,
        errorMessage: "Display Order is mandatory"
      });
    } 
    
    else {
      this.setState({ isValid: true });
    }
  }
  async upsertproduct(event) {
    this.setState({ loading: true });
    event.preventDefault();
    const updatedproductForm = {
      ...this.state.productForm
    };

    await this.validateForm();
    if (this.state.isValid) {
       const dataupdate=
         {
          "GroupGuid": this.state.productGuid,
          "GroupName": this.state.productForm.productgroup.value,
          "LanguageGuid": localStorage.getItem("languageId"),
          "isActive": true,
          "createdBy": localStorage.getItem("userId"),
          "modifiedBy": localStorage.getItem("userId"),
          "DisplayOrder": this.state.productForm.Displayorder.value
         };
     
       const data = {
        "GroupName": this.state.productForm.productgroup.value,
        "languageId": localStorage.getItem("languageId"),
        "isActive": true,
        "createdBy": localStorage.getItem("userId"),
        "modifiedBy": localStorage.getItem("userId"),
        "DisplayOrder": this.state.productForm.Displayorder.value
      };
   
      var config = {
          headers: {
              'Authorization': 'Bearer ' + localStorage.tokenId,
              'Content-Type': 'application/json'
          },
      };
      await axios.post(getServiceUrl() + "masterdata/InsertOrUpdateProductGroup", this.state.productGuid!=null?dataupdate:data, config)
      .then(response => {
        this.setState({ loading: false });
        this.resetForm();
        confirmAlert({
          message: response.data,
          buttons: [
            {
              label: "OK"
            }
          ]
        });
        this.getProductGroupList("");
        
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
        message: this.state.errorMessage,
        buttons: [
          {
            label: "OK"
          }
        ]
      });
    }
  }

  async deleteConfirmation(GroupGuid) {
    confirmAlert({
      message: "Are you sure?",
      buttons: [
        {
          label: "Yes",
          onClick: () => this.deletegroup(GroupGuid)
        },
        {
          label: "No"
        }
      ]
    });
  }
  async deletegroup(GroupGuid){
    var config = {
      headers: {
          'Authorization': 'Bearer ' + localStorage.tokenId,
          'Content-Type': 'application/json',
          'GroupGuid': GroupGuid == undefined ? '' : GroupGuid
      },
  };
  await axios.get(getServiceUrl() + 'masterdata/DeleteProductGroup', config)
      .then((json) => {
        this.getProductGroupList("");
        this.setState({ loading: false });
          confirmAlert({
           message: json.data? "Deleted Successfully" : json.data,
            buttons: [
              {
                label: "OK"
              }
            ]
          });
       
      }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
  }

  ChangeHandler = (event, inputIdentifier) => {
    const updatedproductForm = {
      ...this.state.productForm
    };

   
    const updatedFormElement = {
      ...updatedproductForm[inputIdentifier]
    };

    updatedFormElement.value = event.target.value;

    updatedproductForm[inputIdentifier] = updatedFormElement;
    if(inputIdentifier==="productgroup"){
    if (!this.state.paste) {
      if (this.state.alphaNumericOnly) {
        if (
          event.target.value.length <= updatedFormElement.validation.maxLength
        ) {
          this.setState({
            productForm: updatedproductForm
          });
        }
      }
    }
    }
    if(inputIdentifier==="Displayorder")
    {
       var regex = /^[0-9\b]+$/; 
       var isValid = regex.test(event.target.value);
      if(isValid)
      {
        if ( event.target.value.length <= updatedFormElement.validation.maxLength ) {
          this.setState({ productForm: updatedproductForm  });
        }
      }
    }

  };

  editForm = (productName, productImage, productGuid,displayOrder) => {
    document.documentElement.scrollTop = 0;
    const updatedproductForm = {
      ...this.state.productForm
    };

    const productNameElement = {
      ...updatedproductForm["productgroup"]
    };

    const Emissionelement={
      ...updatedproductForm["Displayorder"]
    };

    productNameElement.value = productName;
    Emissionelement.value = displayOrder;

    updatedproductForm["productgroup"] = productNameElement;
    updatedproductForm["Displayorder"] = Emissionelement;

    this.setState({
      productForm: updatedproductForm,
      SubmitButton: "Update",
      productGuid: productGuid,
      productImage: productImage
    });
  };
  resetForm() {
    const updatedproductForm = {
      ...this.state.productForm
    };

    const productNameElement = {
      ...updatedproductForm["productgroup"]
    };

    const EmissionElement = {
      ...updatedproductForm["Displayorder"]
    };

    productNameElement.value = "";
    EmissionElement.value = "";

    updatedproductForm["productgroup"] = productNameElement;
    updatedproductForm["Displayorder"] = EmissionElement;


    this.setState({
      productForm: updatedproductForm,
      SubmitButton: "Add",
      productGuid: null,
      productImage: null
    });
  }
  async sortProductGroup(ColumnName){
    switch(ColumnName){
      case "groupname":
      if (this.state.GroupNamesort) {
       this.setState({
        GroupNamesort: !this.state.GroupNamesort,
          productList: this.state.productList.sort((a, b) =>
          a.groupName.toString().toLowerCase() > b.groupName.toString().toLowerCase() ? 1 : -1
        
          )
        });
      } else {
       this.setState({
        GroupNamesort: !this.state.GroupNamesort,
          productList: this.state.productList.sort((a, b) =>
           a.groupName.toString().toLowerCase() < b.groupName.toString().toLowerCase() ? 1 : -1
          )
        });
      }
      break;
      case "DisplayOrder":
      if (this.state.DisplayOrdersort) {
       this.setState({
        DisplayOrdersort: !this.state.DisplayOrdersort,
          productList: this.state.productList.sort((a, b) =>
          a.displayOrder > b.displayOrder ? 1 : -1
        
          )
        });
      } else {
       this.setState({
        DisplayOrdersort: !this.state.DisplayOrdersort,
          productList: this.state.productList.sort((a, b) =>
           a.displayOrder < b.displayOrder ? 1 : -1
          )
        });
      }
      break;
      case "CreatedOn":
      if (this.state.GroupCreDatesort) {
        await this.setState({
            GroupCreDatesort: !this.state.GroupCreDatesort,
          productList: this.state.productList.sort((a, b) =>
            a.createdDate > b.createdDate ? 1 : -1
          )
        });
      } else {
        await this.setState({
            GroupCreDatesort: !this.state.GroupCreDatesort,
          productList: this.state.productList.sort((a, b) =>
            a.createdDate < b.createdDate ? 1 : -1
          )
        });
      }
      break;
      case "ModifiedOn" :
        const arrModiDate = this.state.productList.filter(el => {
          return el.modifiedDate != null && el.modifiedDate != ''
         });
         const arrModiDatenull = this.state.productList.filter(el => {
          return el.modifiedDate === null 
         });
        
        if (this.state.GroupModiDatesort) {
         await this.setState({
            GroupModiDatesort: !this.state.GroupModiDatesort,
            productList: arrModiDate.sort((a, b) =>
              a.modifiedDate > b.modifiedDate ? 1 : -1
            )
          });
          await this.setState({ productList: [...this.state.productList, ...arrModiDatenull] });
        } else {
          await this.setState({
            GroupModiDatesort: !this.state.GroupModiDatesort,
            productList: arrModiDate.sort((a, b) =>
              a.modifiedDate < b.modifiedDate ? 1 : -1
            )
          });
          await this.setState({ productList: [...arrModiDatenull, ...this.state.productList] });
      }
      break;
      case "CreatedBy":
          if (this.state.GroupCreBysort) {
            await this.setState({
                GroupCreBysort: !this.state.GroupCreBysort,
              productList: this.state.productList.sort((a, b) =>
                a.createdBy > b.createdBy ? 1 : -1
              )
            });
          } else {
            await this.setState({
                GroupCreBysort: !this.state.GroupCreBysort,
              productList: this.state.productList.sort((a, b) =>
                a.createdBy < b.createdBy ? 1 : -1
              )
            });
      } 
      break;
      case "ModifiedBy" :
            const arrModiby = this.state.productList.filter(el => {
              return el.modifiedBy != null && el.modifiedBy != ''
             });
             const arrModibynull = this.state.productList.filter(el => {
              return el.modifiedBy === null 
             });
            if (this.state.GroupModiBysort) {
            await this.setState({
                GroupModiBysort: !this.state.GroupModiBysort,
                productList: arrModiby.sort((a, b) =>
                  a.modifiedBy > b.modifiedBy ? 1 : -1
                )
              });
              await this.setState({ productList: [...this.state.productList, ...arrModibynull] });
            } else {
              await this.setState({
                GroupModiBysort: !this.state.GroupModiBysort,
                productList: arrModiby.sort((a, b) =>
                  a.modifiedBy < b.modifiedBy ? 1 : -1
                )
              });
              await this.setState({ productList: [...arrModibynull, ...this.state.productList] });
      }
      break; 
    }
  }

  render() {
    let formElementsArray = [];

    for (let key in this.state.productForm) {
      formElementsArray.push({
        id: key,
        config: this.state.productForm[key]
      });
    }
    let productList = this.state.productList.map(item => (
      <React.Fragment>
        <tr>
          <td>
            <p>{item.groupName}</p>
          </td>
          <td>
            <p>{item.createdDate !=null ?  moment(item.createdDate).format("DD/MM/YYYY") : "" }</p>
          </td>
          <td>
            <p>{item.createdBy}</p>
          </td>
          <td>
            <p>{item.modifiedDate !=null ?  moment(item.modifiedDate).format("DD/MM/YYYY") : "" }</p>
          </td>
          <td>
            <p>{item.modifiedBy}</p>
          </td>
          <td>
            <p>{item.displayOrder}</p>
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
                      item.groupName,
                      item.groupImage,
                      item.groupGuid,
                      item.displayOrder
                    )
                  }
                />
                <Delete
                  data-tip
                  data-for="error2"
                  onClick={() =>
                    this.deleteConfirmation(
                      item.groupGuid
                     
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
              Add/Edit product group name
            </h6>
          </div>
          <div className="category_form">
            <GridContainer>
              {formElementsArray.map(formElement => (
                <GridItem key={formElement.id} md={4} xs={12}>
                  <div className="newThemeInput">
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
                    />
                  </div>
                </GridItem>
              ))}
              <GridItem md={8} xs={12}>
                <div className="">
                  <Button
                    outlineBtnNew
                    onClick={event => this.upsertproduct(event)}
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
                        value={this.state.searchProduct}
                      />
                    </div>
                  </div>
                </GridItem>
                <GridItem md={8} xs={12}>
                  <div>
                    <Button
                      outlineBtnNew
                      onClick={() =>
                        this.getProductGroupList(this.state.searchProduct)
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
                      <th onClick={() => this.sortProductGroup("groupname")}>
                        <div className="sort_category">
                          Product group name
                          {this.state.GroupNamesort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortProductGroup("CreatedOn")}>
                        <div className="sort_category">
                          Created On
                          {this.state.GroupCreDatesort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortProductGroup("CreatedBy")}>
                        <div className="sort_category">
                          Created By
                          {this.state.GroupCreBysort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortProductGroup("ModifiedOn")}>
                        <div className="sort_category">
                          Modified On
                          {this.state.GroupModiDatesort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortProductGroup("ModifiedBy")}>
                        <div className="sort_category">
                        Modified By
                          {this.state.GroupModiBysort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortProductGroup("DisplayOrder")}>
                        <div className="sort_category">
                        Display Order
                          {this.state.DisplayOrdersort ? <ExpandMore /> : <ExpandLess />}
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
                    ) : productList.length > 0 ? (
                      productList
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
export default ProductGroupnameManagement;