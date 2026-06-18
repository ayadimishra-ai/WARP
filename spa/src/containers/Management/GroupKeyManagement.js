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
import { AllCategoryList, getAllGroupKeyList } from "../../utility";
const initialState = {
  GroupKeyForm: {
    GroupKey: {
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
      label: "GroupKey *"
    },
    category: {
        elementType: "select_2",
        class: "newInput_2",
        elementConfig: {
          // type: "select",
          options: [],
          // value: 0
        },
        value: '',
        label: "Select Category *",
        validation: {
          required: true
        },
        errorMessage: "Please select a category.",
        valid: false,
        touched: false
    },
    showAsFilter: {
        elementType: 'checkbox',
        elementConfig: {
            type: 'checkbox',
            disabled: false,
            dbValue: '',
            isValueChange: false,
        },
        validation: {},
        errorMessage: '',
        valid: true,
        touched: false,
        checkBoxLabel: 'Show As Filter',
        checked: false
    },
  },
  isValid: false,
  errorMessage: "",
  loading: false,
  SubmitButton: "Add",
  groupkeyList: [],
  groupKeyGuid: null,
  searchGroupKey: "",
  alphaNumericOnly: true,
  paste: false,
  categoryList:[],
  GroupKeycategoryNamesort: true,
  GroupKeyNamesort: true,
  GroupKeyModiDatesort: true,
  GroupKeyCreDatesort: true,
  GroupKeyCreBysort: true,
  GroupKeyModiBysort: true,
};

class GroupKeyManagement extends Component {
  state = { ...initialState }; // use spread operator to avoid mutation

  constructor(props) {
    super(props);
    this.AllCategoryList = this.AllCategoryList.bind(this);
  }
  handleChange(checked) {
    this.setState({ checked });
  }
  async componentDidMount() {
    await this.AllCategoryList("");
    this.getAllGroupKeyList("");
  }
  changeSearch(event) {
    this.setState({ searchGroupKey: event.target.value });
  }
  resetSearch() {
   
    this.getAllGroupKeyList("");
    this.setState({ searchGroupKey: "" });
  }
getAllGroupKeyList(searchGroupKey) {
    this.setState({
      loading: true
    });
    getAllGroupKeyList(searchGroupKey)
      .then(groupkeyList => {
        this.setState({
            groupkeyList: groupkeyList,
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

  async sortgroupkey(ColumnName){
    switch(ColumnName){
      case"GroupKeyName":
      if (this.state.GroupKeyNamesort) {
        this.setState({
          GroupKeyNamesort: !this.state.GroupKeyNamesort,
          groupkeyList: this.state.groupkeyList.sort((a, b) =>
            a.groupName.toString().toLowerCase() > b.groupName.toString().toLowerCase() ? 1 : -1
          ),
          GroupKeycategoryNamesort: true,
          GroupKeyModiDatesort: true,
          GroupKeyCreDatesort: true,
          GroupKeyCreBysort: true,
          GroupKeyModiBysort: true,
        });
      } else {
        
        this.setState({
          GroupKeyNamesort: !this.state.GroupKeyNamesort,
          groupkeyList: this.state.groupkeyList.sort((a, b) =>
            a.groupName.toString().toLowerCase() < b.groupName.toString().toLowerCase() ? 1 : -1
          ),
          GroupKeycategoryNamesort: true,
          GroupKeyModiDatesort: true,
          GroupKeyCreDatesort: true,
          GroupKeyCreBysort: true,
          GroupKeyModiBysort: true,
        });
        
      }
      break;
      case"CategoryName":
      if (this.state.GroupKeycategoryNamesort) {
        this.setState({
          GroupKeycategoryNamesort: !this.state.GroupKeycategoryNamesort,
          groupkeyList: this.state.groupkeyList.sort((a, b) =>
            a.categoryName.toString().toLowerCase() > b.categoryName.toString().toLowerCase() ? 1 : -1
          ),
          GroupKeyNamesort: true,
          GroupKeyModiDatesort: true,
          GroupKeyCreDatesort: true,
          GroupKeyCreBysort: true,
          GroupKeyModiBysort: true,
        });
      } else {
        
        this.setState({
          GroupKeycategoryNamesort: !this.state.GroupKeycategoryNamesort,
          groupkeyList: this.state.groupkeyList.sort((a, b) =>
            a.categoryName.toString().toLowerCase() < b.categoryName.toString().toLowerCase() ? 1 : -1
          ),
          GroupKeyNamesort: true,
          GroupKeyModiDatesort: true,
          GroupKeyCreDatesort: true,
          GroupKeyCreBysort: true,
          GroupKeyModiBysort: true,
        });
        
      }
      break;
      case "CreatedDate":
        if (this.state.GroupKeyCreDatesort) {
          this.setState({
            GroupKeyCreDatesort: !this.state.GroupKeyCreDatesort,
            groupkeyList: this.state.groupkeyList.sort((a, b) =>
              a.createdDate.toString().toLowerCase() > b.createdDate.toString().toLowerCase() ? 1 : -1
            ),
            GroupKeycategoryNamesort: true,
            GroupKeyNamesort: true,
            GroupKeyModiDatesort: true,
           
            GroupKeyCreBysort: true,
            GroupKeyModiBysort: true,
          });
         
        } else {
          this.setState({
            GroupKeyCreDatesort: !this.state.GroupKeyCreDatesort,
            groupkeyList: this.state.groupkeyList.sort((a, b) =>
              a.createdDate.toString().toLowerCase() < b.createdDate.toString().toLowerCase() ? 1 : -1
            ),
            GroupKeycategoryNamesort: true,
            GroupKeyNamesort: true,
            GroupKeyModiDatesort: true,
           
            GroupKeyCreBysort: true,
            GroupKeyModiBysort: true,
          });
        }
      break;
      case "ModifiedDate" :
        const arrModiDate = this.state.groupkeyList.filter(el => {
          return el.modifiedDate != null && el.modifiedDate != ''
         });
         const arrModiDatenull = this.state.groupkeyList.filter(el => {
          return el.modifiedDate === null 
         });
        if (this.state.GroupKeyModiDatesort) {
          await this.setState({
            GroupKeyModiDatesort: !this.state.GroupKeyModiDatesort,
            groupkeyList: arrModiDate.sort((a, b) =>
             a.modifiedDate > b.modifiedDate ? 1 : -1
            ),
            GroupKeycategoryNamesort: true,
           GroupKeyNamesort: true,
          
           GroupKeyCreDatesort: true,
           GroupKeyCreBysort: true,
           GroupKeyModiBysort: true,
          });
          await this.setState({ groupkeyList: [...this.state.groupkeyList, ...arrModiDatenull] });
         
        } 
        else {
          await this.setState({
            GroupKeyModiDatesort: !this.state.GroupKeyModiDatesort,
            groupkeyList: arrModiDate.sort((a, b) =>
            a.modifiedDate < b.modifiedDate ? 1 : -1
            ),
            GroupKeycategoryNamesort: true,
            GroupKeyNamesort: true,
            
            GroupKeyCreDatesort: true,
            GroupKeyCreBysort: true,
            GroupKeyModiBysort: true,
          });
          await this.setState({ groupkeyList: [...arrModiDatenull, ...this.state.groupkeyList] });
        }
      break;
      case "CreatedBy":
        if (this.state.GroupKeyCreBysort) {
          this.setState({
            GroupKeyCreBysort: !this.state.GroupKeyCreBysort,
            groupkeyList: this.state.groupkeyList.sort((a, b) =>
              a.createdBy.toString().toLowerCase() > b.createdBy.toString().toLowerCase() ? 1 : -1
            ),
            GroupKeycategoryNamesort: true,
            GroupKeyNamesort: true,
            GroupKeyModiDatesort: true,
            GroupKeyCreDatesort: true,
            
            GroupKeyModiBysort: true,
          });
         
        } else {
          this.setState({
            GroupKeyCreBysort: !this.state.GroupKeyCreBysort,
            groupkeyList: this.state.groupkeyList.sort((a, b) =>
              a.createdBy.toString().toLowerCase() < b.createdBy.toString().toLowerCase() ? 1 : -1
            ),
            GroupKeycategoryNamesort: true,
           GroupKeyNamesort: true,
           GroupKeyModiDatesort: true,
           GroupKeyCreDatesort: true,
           GroupKeyModiBysort: true,
          });
        }
      break;
      case "ModifiedBy" :
        const arrFiltered = this.state.groupkeyList.filter(el => {
          return el.modifiedBy != null && el.modifiedBy != ''
         });
         const arrFilterednull = this.state.groupkeyList.filter(el => {
          return el.modifiedBy === null 
         });
        if (this.state.GroupKeyModiBysort) {
          await this.setState({
            GroupKeyModiBysort: !this.state.GroupKeyModiBysort,
            groupkeyList: arrFiltered.sort((a, b) =>
           a.ModifiedBy > b.ModifiedBy ? 1 : -1
            ),
            GroupKeycategoryNamesort: true,
            GroupKeyNamesort: true,
            GroupKeyModiDatesort: true,
            GroupKeyCreDatesort: true,
            GroupKeyCreBysort: true,
           
          });
          await   this.setState({ groupkeyList: [...this.state.groupkeyList, ...arrFilterednull] });
        } else {
         await this.setState({
            GroupKeyModiBysort: !this.state.GroupKeyModiBysort,
            groupkeyList: arrFiltered.sort((a, b) =>
            a.ModifiedBy < b.ModifiedBy ? 1 : -1
            ),
            GroupKeycategoryNamesort: true,
            GroupKeyNamesort: true,
            GroupKeyModiDatesort: true,
            GroupKeyCreDatesort: true,
            GroupKeyCreBysort: true,
          });
          await this.setState({ groupkeyList: [...arrFilterednull, ...this.state.groupkeyList] });
          
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
    if (this.state.GroupKeyForm.GroupKey.value.trim() === "") {
      this.setState({
        isValid: false,
        errorMessage: "GroupKey name is mandatory"
      });
    }
    else if (this.state.GroupKeyForm.category.value.trim() === "") {
      this.setState({
        isValid: false,
        errorMessage: "Category is mandatory"
      });
    }
    
    else {
      this.setState({ isValid: true });
    }
  }
  async upsertGroupKey(event) {
    this.setState({ loading: true });
    event.preventDefault();
    const updatedgroupkeuForm = {
      ...this.state.GroupKeyForm
    };
    const formData = {
        GroupKeyGuid: this.state.groupKeyGuid === null || this.state.groupKeyGuid === "null" || this.state.groupKeyGuid === "" || this.state.groupKeyGuid === undefined ? "00000000-0000-0000-0000-000000000000": this.state.groupKeyGuid,
      GroupName: updatedgroupkeuForm.GroupKey.value,
      CategoryGuid: updatedgroupkeuForm.category.value,
      ShowAsFilter:updatedgroupkeuForm.showAsFilter.checked,
      CreatedBy: localStorage.getItem("userId"),
      ModifiedBy:localStorage.getItem("userId"),
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
        .post(getServiceUrl() + "MasterData/InsertOrUpdateProductGroupKey", formData, config)
        .then(response => {
          this.getAllGroupKeyList("");
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

  async deleteGroupkeyConfirmation(GroupKeyGuid) {
    confirmAlert({
      message: "Are you sure?",
      buttons: [
        {
          label: "Yes",
          onClick: () => this.deleteGroupKey(GroupKeyGuid)
        },
        {
          label: "No"
        }
      ]
    });
  }
  
  deleteGroupKey(GroupKeyGuid) {
  var config = {
      headers: {
          'Authorization': 'Bearer ' + localStorage.tokenId,
          'Content-Type': 'application/json',
          'GroupKeyGuid': GroupKeyGuid
      },
  };
  
  axios.get(getServiceUrl() + 'MasterData/DeleteProductGroupKey?', config)
      .then((response) => {
        this.getAllGroupKeyList("");
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
    const updatedgroupkeyForm = {
      ...this.state.GroupKeyForm
    };

    const updatedFormElement = {
      ...updatedgroupkeyForm[inputIdentifier]
    };

    updatedFormElement.value = event.target.value;

    updatedgroupkeyForm[inputIdentifier] = updatedFormElement;
    if(inputIdentifier === "category"){
        this.setState({
            GroupKeyForm: updatedgroupkeyForm
          });
    }
    if(inputIdentifier=="showAsFilter")
    {
      if(updatedgroupkeyForm.showAsFilter.checked)
      {
        updatedFormElement.checked=false;
      }
      else{
        updatedFormElement.checked=true;
      }
      updatedgroupkeyForm[inputIdentifier] = updatedFormElement;
      this.setState({
        GroupKeyForm: updatedgroupkeyForm
      });
      
    }
    if (!this.state.paste) {
      if (this.state.alphaNumericOnly) {
        if (
          event.target.value.length <= updatedFormElement.validation.maxLength
        ) {
          this.setState({
            GroupKeyForm: updatedgroupkeyForm
          });
        }
      }
    }
  };

  editForm = (groupName,groupKeyGuid,categoryGuid,showAsFilter) => {
    document.documentElement.scrollTop = 0;
    const updatedgroupkeyForm = {
      ...this.state.GroupKeyForm
    };

    const GroupkeyNameElement = {
      ...updatedgroupkeyForm["GroupKey"]
    };
    
    const categoryElement = {
      ...updatedgroupkeyForm["category"]
    };
    const showAsFilterElement = {
      ...updatedgroupkeyForm["showAsFilter"]
    };

    GroupkeyNameElement.value = groupName;
    categoryElement.value = categoryGuid;
    showAsFilterElement.checked = showAsFilter;

    updatedgroupkeyForm["GroupKey"] = GroupkeyNameElement;
    updatedgroupkeyForm["category"]=categoryElement;
    updatedgroupkeyForm["showAsFilter"]=showAsFilterElement;

    this.setState({
      GroupKeyForm: updatedgroupkeyForm,
      SubmitButton: "Update",
      groupKeyGuid: groupKeyGuid
    });
  };
  resetForm() {
    const updatedgroupkeyForm = {
      ...this.state.GroupKeyForm
    };

    const GroupkeyNameElement = {
      ...updatedgroupkeyForm["GroupKey"]
    };
    const categoryElement = {
      ...updatedgroupkeyForm["category"]
    };
    const ShowAsFilterElement = {
      ...updatedgroupkeyForm["showAsFilter"]
    };

    GroupkeyNameElement.value = "";
    categoryElement.value = null;
    ShowAsFilterElement.checked=false;

    updatedgroupkeyForm["GroupKey"] = GroupkeyNameElement;
    updatedgroupkeyForm["category"]=categoryElement;
    updatedgroupkeyForm["showAsFilter"]=ShowAsFilterElement;

    this.setState({
      GroupKeyForm: updatedgroupkeyForm,
      SubmitButton: "Add",
      groupKeyGuid: null
     
    });
  }
  async AllCategoryList() {
    this.setState({
      loading: true
    });
    const updatedFormInfo = {
        ...this.state.GroupKeyForm
      };
    await AllCategoryList()
      .then(categoryList => {
        updatedFormInfo.category.elementConfig.options = categoryList;
        this.setState({
          GroupKeyForm: updatedFormInfo,
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

  render() {
    let formElementsArray = [];
    for (let key in this.state.GroupKeyForm) {
      formElementsArray.push({
        id: key,
        config: this.state.GroupKeyForm[key]
      });
    }
   /*console.log(this.state.groupkeyList);*/
    let groupkeyList = this.state.groupkeyList.map(item => (
      <React.Fragment>
        <tr>
          <td>
            <p>{item.groupName}</p>
          </td>
          <td>
            <p>{item.categoryName}</p>
          </td>
          <td>
            <p>{item.showAsFilter? "YES" :"No"}</p>
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
                      item.groupName,
                      item.groupKeyGuid,
                      item.categoryGuid,
                      item.showAsFilter
                    )
                  }
                />
                <Delete
                  data-tip
                  data-for="error2"
                  onClick={() =>
                    this.deleteGroupkeyConfirmation(
                      item.groupKeyGuid
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
              Add/Edit GroupKey
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
                      checked={formElement.config.checked}
                    />
                  </div>
                </GridItem>
              ))}
              <GridItem md={8} xs={12}>
                <div className="">
                  <Button
                    outlineBtnNew
                    onClick={event => this.upsertGroupKey(event)}
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
                        value={this.state.searchGroupKey}
                      />
                    </div>
                  </div>
                </GridItem>
                <GridItem md={8} xs={12}>
                  <div>
                    <Button
                      outlineBtnNew
                      onClick={() =>
                        this.getAllGroupKeyList(this.state.searchGroupKey)
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
                      <th onClick={() => this.sortgroupkey("GroupKeyName")}>
                        <div className="sort_category">
                          GroupKey Name
                          {this.state.GroupKeyNamesort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortgroupkey("CategoryName")}>
                        <div className="sort_category">
                          Category Name
                          {this.state.GroupKeycategoryNamesort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th>
                        <div className="sort_category">
                        show As Filter
                        </div>
                      </th>
                      <th onClick={() => this.sortgroupkey("CreatedDate")}>
                        <div className="sort_category">
                        Created Date
                          {this.state.GroupKeyCreDatesort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortgroupkey("CreatedBy")}>
                        <div className="sort_category">
                        Created By
                          {this.state.GroupKeyCreBysort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortgroupkey("ModifiedDate")}>
                        <div className="sort_category">
                        Modified Date
                          {this.state.GroupKeyModiDatesort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortgroupkey("ModifiedBy")}>
                        <div className="sort_category">
                        Modified By
                          {this.state.GroupKeyModiBysort ? <ExpandMore /> : <ExpandLess />}
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
                    ) : groupkeyList.length > 0 ? (
                      groupkeyList
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
export default GroupKeyManagement;