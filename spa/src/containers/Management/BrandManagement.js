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
import { getServiceUrl, getWebsiteGUID } from "../../config";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from "../../UI/Spinner/Spinner";
import { getAllBrandList } from "../../utility";
const initialState = {
  brandForm: {
    brand: {
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
      label: "Brand *"
    }
  },
  isValid: false,
  errorMessage: "",
  loading: false,
  SubmitButton: "Add",
  brandList: [],
  BrandGuid: null,
  oldValues: [],
  newValues: [],
  searchBrand: "",
  alphaNumericOnly: true,
  paste: false,
  BrandNamesort: true,
  BrandModiDatesort: true,
  BrandCreDatesort: true,
  BrandCreBysort: true,
  BrandModiBysort: true,
};

class BrandManagement extends Component {
  state = { ...initialState }; // use spread operator to avoid mutation

  constructor(props) {
    super(props);
  }
  handleChange(checked) {
    this.setState({ checked });
  }
  async componentDidMount() {
    this.getAllBrandList("");
  }
  changeSearch(event) {
    this.setState({ searchBrand: event.target.value });
  }
  resetSearch() {
   
    this.getAllBrandList("");
    this.setState({ searchBrand: "" });
  }
  getAllBrandList(searchBrand) {
    this.setState({
      loading: true
    });
    getAllBrandList(searchBrand)
      .then(brandList => {
        this.setState({
          brandList: brandList,
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

  async sortBrand(ColumnName){
    switch(ColumnName){
      case"BrandName":
      if (this.state.BrandNamesort) {
        this.setState({
          BrandNamesort: !this.state.BrandNamesort,
          brandList: this.state.brandList.sort((a, b) =>
            a.brandName.toString().toLowerCase() > b.brandName.toString().toLowerCase() ? 1 : -1
          ),
          BrandModiDatesort: true,
          BrandCreDatesort: true,
          BrandCreBysort: true,
          BrandModiBysort: true,
        });
      } else {
        
        this.setState({
          BrandNamesort: !this.state.BrandNamesort,
          brandList: this.state.brandList.sort((a, b) =>
            a.brandName.toString().toLowerCase() < b.brandName.toString().toLowerCase() ? 1 : -1
          ),
          BrandModiDatesort: true,
          BrandCreDatesort: true,
          BrandCreBysort: true,
          BrandModiBysort: true,
        });
        
      }
      break;
      case "CreatedDate":
        if (this.state.BrandCreDatesort) {
          this.setState({
            BrandCreDatesort: !this.state.BrandCreDatesort,
            brandList: this.state.brandList.sort((a, b) =>
              a.createdDate.toString().toLowerCase() > b.createdDate.toString().toLowerCase() ? 1 : -1
            ),
            BrandNamesort: true,
            BrandModiDatesort: true,
            BrandCreBysort: true,
            BrandModiBysort: true,
          });
         
        } else {
          this.setState({
            BrandCreDatesort: !this.state.BrandCreDatesort,
            brandList: this.state.brandList.sort((a, b) =>
              a.createdDate.toString().toLowerCase() < b.createdDate.toString().toLowerCase() ? 1 : -1
            ),
            BrandNamesort: true,
            BrandModiDatesort: true,
            BrandCreBysort: true,
            BrandModiBysort: true,
          });
        }
      break;
      case "ModifiedDate" :
        const arrModiDate = this.state.brandList.filter(el => {
          return el.modifiedDate != null && el.modifiedDate != ''
         });
         const arrModiDatenull = this.state.brandList.filter(el => {
          return el.modifiedDate === null 
         });
        if (this.state.BrandModiDatesort) {
          await this.setState({
            BrandModiDatesort: !this.state.BrandModiDatesort,
            brandList: arrModiDate.sort((a, b) =>
             a.modifiedDate > b.modifiedDate ? 1 : -1
            ),
            BrandNamesort: true,
            BrandCreDatesort: true,
            BrandCreBysort: true,
            BrandModiBysort: true,
          });
          await this.setState({ brandList: [...this.state.brandList, ...arrModiDatenull] });
         
        } 
        else {
          await this.setState({
            BrandModiDatesort: !this.state.BrandModiDatesort,
            brandList: arrModiDate.sort((a, b) =>
            a.modifiedDate < b.modifiedDate ? 1 : -1
            ),
            BrandNamesort: true,
            BrandCreDatesort: true,
            BrandCreBysort: true,
            BrandModiBysort: true,
          });
          await this.setState({ brandList: [...arrModiDatenull, ...this.state.brandList] });
        }
      break;
      case "CreatedBy":
        if (this.state.BrandCreBysort) {
          this.setState({
            BrandCreBysort: !this.state.BrandCreBysort,
            brandList: this.state.brandList.sort((a, b) =>
              a.createdBy.toString().toLowerCase() > b.createdBy.toString().toLowerCase() ? 1 : -1
            ),
            BrandNamesort: true,
            BrandModiDatesort: true,
            BrandCreDatesort: true,
            BrandModiBysort: true,
          });
         
        } else {
          this.setState({
            BrandCreBysort: !this.state.BrandCreBysort,
            brandList: this.state.brandList.sort((a, b) =>
              a.createdBy.toString().toLowerCase() < b.createdBy.toString().toLowerCase() ? 1 : -1
            ),
            BrandNamesort: true,
            BrandModiDatesort: true,
            BrandCreDatesort: true,
            BrandModiBysort: true,
          });
        }
      break;
      case "ModifiedBy" :
        const arrFiltered = this.state.brandList.filter(el => {
          return el.modifiedBy != null && el.modifiedBy != ''
         });
         const arrFilterednull = this.state.brandList.filter(el => {
          return el.modifiedBy === null 
         });
        if (this.state.BrandModiBysort) {
          await this.setState({
            BrandModiBysort: !this.state.BrandModiBysort,
            brandList: arrFiltered.sort((a, b) =>
           a.ModifiedBy > b.ModifiedBy ? 1 : -1
            ),
            BrandNamesort: true,
            BrandModiDatesort: true,
            BrandCreDatesort: true,
            BrandCreBysort: true,
          });
          await   this.setState({ brandList: [...this.state.brandList, ...arrFilterednull] });
        } else {
         await this.setState({
            BrandModiBysort: !this.state.BrandModiBysort,
            brandList: arrFiltered.sort((a, b) =>
            a.ModifiedBy < b.ModifiedBy ? 1 : -1
            ),
            BrandNamesort: true,
            BrandModiDatesort: true,
            BrandCreDatesort: true,
            BrandCreBysort: true,
          });
          await this.setState({ brandList: [...arrFilterednull, ...this.state.brandList] });
          
        }
      break; 
    }
  
  }
  enterkey = e => {
    this.setState({ paste: false });
    var keyCode = e.keyCode || e.which;
    //Regex for Valid Characters i.e. Alphabets and Numbers.
    var regex = /[/[a-zA-Z &]+$/;

    //Validate TextBox value against the Regex.
    var isValid = regex.test(String.fromCharCode(keyCode));
    this.setState({ alphaNumericOnly: isValid });
  };
  onPaste = () => {
    this.setState({ paste: true });
  };
  validateForm() {
    if (this.state.brandForm.brand.value === "") {
      this.setState({
        isValid: false,
        errorMessage: "Brand name is mandatory"
      });
    } else {
      this.setState({ isValid: true });
    }
  }
  async upsertBrand(event) {
    this.setState({ loading: true });
    event.preventDefault();
    const updatedbrandForm = {
      ...this.state.brandForm
    };
    const formData = {
      BrandGuid: this.state.BrandGuid === null || this.state.BrandGuid === undefined || this.state.BrandGuid === "null" || this.state.BrandGuid === "" ? "00000000-0000-0000-0000-000000000000" : this.state.BrandGuid,
      BrandName: updatedbrandForm.brand.value,
      LanguageGuid: localStorage.getItem("languageId"),
      IsActive: 1,
      CreatedBy: localStorage.getItem("userId"),
      ModifiedBy:localStorage.getItem("userId"),
      WebsiteGuid: getWebsiteGUID(),
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

   await this.validateForm();
    if (this.state.isValid) {
      await axios
        .post(getServiceUrl() + "MasterData/InsertOrUpdateBrand", formData, config)
        .then(response => {
          this.getAllBrandList("");
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

  async deleteBrandConfirmation(BrandGuid) {
    confirmAlert({
      message: "Are you sure?",
      buttons: [
        {
          label: "Yes",
          onClick: () => this.deleteBrand(BrandGuid)
        },
        {
          label: "No"
        }
      ]
    });
  }
  
  deleteBrand(BrandGuid) {
    var body = {
      // 'BrandGuid': BrandGuid
   };
  var config = {
      headers: {
          'Authorization': 'Bearer ' + localStorage.tokenId,
          'Content-Type': 'application/json',
          'BrandGuid': BrandGuid
      },
  };
  axios.post(getServiceUrl() + 'MasterData/DeleteBrand?',body , config)
      .then((response) => {
        this.getAllBrandList("");
          if (response.data === "True") {
            confirmAlert({
                        message: "Deleted successfully",
                        buttons: [
                          {
                            label: "OK"
                          }
                        ]
                      });
          }
      }).catch((err) => {
          confirmAlert({
              message: "Something went wrong. Please try again.",
              buttons: [
                  {
                      label: 'OK',
                      onClick: () => {
                          this.setState({ loading: false });
                      }
                  }
              ]
          });
      });

  }


  ChangeHandler = (event, inputIdentifier) => {
    const updatedbrandForm = {
      ...this.state.brandForm
    };

    const updatedFormElement = {
      ...updatedbrandForm[inputIdentifier]
    };

    updatedFormElement.value = event.target.value;

    updatedbrandForm[inputIdentifier] = updatedFormElement;
    if (!this.state.paste) {
      if (this.state.alphaNumericOnly) {
        if (
          event.target.value.length <= updatedFormElement.validation.maxLength
        ) {
          this.setState({
            brandForm: updatedbrandForm,
            newValues: updatedbrandForm
          });
        }
      }
    }
  };

  editForm = (BrandName,brandGuid) => {
    document.documentElement.scrollTop = 0;
    const updatedbrandForm = {
      ...this.state.brandForm
    };

    const brandNameElement = {
      ...updatedbrandForm["brand"]
    };

    brandNameElement.value = BrandName;

    updatedbrandForm["brand"] = brandNameElement;
    this.setState({
      brandForm: updatedbrandForm,
      oldValues: updatedbrandForm,
      SubmitButton: "Update",
      BrandGuid: brandGuid
    });
  };
  resetForm() {
    const updatedbrandForm = {
      ...this.state.brandForm
    };

    const brandNameElement = {
      ...updatedbrandForm["brand"]
    };

    brandNameElement.value = "";

    updatedbrandForm["brand"] = brandNameElement;

    this.setState({
      brandForm: updatedbrandForm,
      SubmitButton: "Add",
      BrandGuid: null
     
    });
  }
  
    render() {
    let formElementsArray = [];
    for (let key in this.state.brandForm) {
      formElementsArray.push({
        id: key,
        config: this.state.brandForm[key]
      });
    }
   
    let brandList = this.state.brandList.map(item => (
      <React.Fragment>
        <tr>
          <td>
            <p>{item.brandName}</p>
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
                      item.brandName,
                      item.brandGuid
                    )
                  }
                />
                <Delete
                  data-tip
                  data-for="error2"
                  onClick={() =>
                    this.deleteBrandConfirmation(
                      item.brandGuid
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
              Add/Edit Brand
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
                    onClick={event => this.upsertBrand(event)}
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
                        value={this.state.searchBrand}
                      />
                    </div>
                  </div>
                </GridItem>
                <GridItem md={8} xs={12}>
                  <div>
                    <Button
                      outlineBtnNew
                      onClick={() =>
                        this.getAllBrandList(this.state.searchBrand)
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
                      <th onClick={() => this.sortBrand("BrandName")}>
                        <div className="sort_category">
                          Brand Name
                          {this.state.BrandNamesort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortBrand("CreatedDate")}>
                        <div className="sort_category">
                        Created Date
                          {this.state.BrandCreDatesort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortBrand("CreatedBy")}>
                        <div className="sort_category">
                        Created By
                          {this.state.BrandCreBysort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortBrand("ModifiedDate")}>
                        <div className="sort_category">
                        Modified Date
                          {this.state.BrandModiDatesort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortBrand("ModifiedBy")}>
                        <div className="sort_category">
                        Modified By
                          {this.state.BrandModiBysort ? <ExpandMore /> : <ExpandLess />}
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
                    ) : brandList.length > 0 ? (
                      brandList
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
export default BrandManagement;