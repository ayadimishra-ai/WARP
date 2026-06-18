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
import { getAWSUrl, getServiceUrl, getWebsiteGUID, getWebsiteUrl } from "../../config";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from "../../UI/Spinner/Spinner";
import { getAllGreenPropertiesList } from "../../utility";
const awsUrl = getWebsiteUrl();
const initialState = {
    GreenPropertiesForm: {
    GreenProperties: {
      elementType: "input_2",
      class: "newInput_2",
      elementConfig: {
        type: "text",
        // placeholder: "GreenProperties"
      },
      value: "",
      validation: {
        required: true,
        maxLength: 50
      },
      valid: true,
      touched: false,
      formControlProps: { fullWidth: true },
      label: "Green property *"
    },
    blank: {
      elementType: "",
    },
    GreenpropertyIcon : {
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
      fileLabel:'Green property icon'
    },
    
  },
  isValid: false,
  errorMessage: "",
  loading: false,
  SubmitButton: "Add",
  GreenPropertiesList: [],
  GreenPropertiesGuid: null,
  searchGreenProperties: "",
  alphaNumericOnly: true,
  paste: false,
  GreenPropertyNamesort: true,
  GreenPropertyModiDatesort: true,
  GreenPropertyCreDatesort: true,
  GreenPropertyCreBysort: true,
  GreenPropertyModiBysort: true,
  selectedFileIcon: null,
  GreenPropertiesIcon:null,
  imageUploadError: null,
};

class GreenPropertiesManagement extends Component {
  state = { ...initialState }; // use spread operator to avoid mutation

  constructor(props) {
    super(props);
  }
  handleChange(checked) {
    this.setState({ checked });
  }
  async componentDidMount() {
    this.getAllGreenPropertiesList("");
    
    
  }
  changeSearch(event) {
    this.setState({ searchGreenProperties: event.target.value });
  }
  resetSearch() {
    this.getAllGreenPropertiesList("");
    this.setState({ searchGreenProperties: "" });
  }
  getAllGreenPropertiesList(searchGreenProperties) {
    this.setState({
      loading: true
    });
    getAllGreenPropertiesList(searchGreenProperties)
      .then(GreenPropertiesList => {
        this.setState({
          GreenPropertiesList: GreenPropertiesList,
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
async sortGreenProperty(ColumnName){
  switch(ColumnName){
    case"Name":
    if (this.state.GreenPropertyNamesort) {
     this.setState({
        GreenPropertyNamesort: !this.state.GreenPropertyNamesort,
        GreenPropertiesList: this.state.GreenPropertiesList.sort((a, b) =>
        a.greenPropertyName.toString().toLowerCase() > b.greenPropertyName.toString().toLowerCase() ? 1 : -1
      
        )
      });
    } else {
     this.setState({
        GreenPropertyNamesort: !this.state.GreenPropertyNamesort,
        GreenPropertiesList: this.state.GreenPropertiesList.sort((a, b) =>
         a.greenPropertyName.toString().toLowerCase() < b.greenPropertyName.toString().toLowerCase() ? 1 : -1
        )
      });
    }
    break;
    case "CreatedOn":
    if (this.state.GreenPropertyCreDatesort) {
      await this.setState({
        GreenPropertyCreDatesort: !this.state.GreenPropertyCreDatesort,
        GreenPropertiesList: this.state.GreenPropertiesList.sort((a, b) =>
          a.createdDate > b.createdDate ? 1 : -1
        )
      });
    } else {
      await this.setState({
        GreenPropertyCreDatesort: !this.state.GreenPropertyCreDatesort,
        GreenPropertiesList: this.state.GreenPropertiesList.sort((a, b) =>
          a.createdDate < b.createdDate ? 1 : -1
        )
      });
    }
    break;
    case "ModifiedOn" :
      const arrModiDate = this.state.GreenPropertiesList.filter(el => {
        return el.modifiedDate != null && el.modifiedDate != ''
       });
       const arrModiDatenull = this.state.GreenPropertiesList.filter(el => {
        return el.modifiedDate === null 
       });
      
      if (this.state.GreenPropertyModiDatesort) {
       await this.setState({
          GreenPropertyModiDatesort: !this.state.GreenPropertyModiDatesort,
          GreenPropertiesList: arrModiDate.sort((a, b) =>
            a.modifiedDate > b.modifiedDate ? 1 : -1
          )
        });
        await this.setState({ GreenPropertiesList: [...this.state.GreenPropertiesList, ...arrModiDatenull] });
      } else {
        await this.setState({
          GreenPropertyModiDatesort: !this.state.GreenPropertyModiDatesort,
          GreenPropertiesList: arrModiDate.sort((a, b) =>
            a.modifiedDate < b.modifiedDate ? 1 : -1
          )
        });
        await this.setState({ GreenPropertiesList: [...arrModiDatenull, ...this.state.GreenPropertiesList] });
    }
    break;
    case "CreatedBy":
        if (this.state.GreenPropertyCreBysort) {
          await this.setState({
            GreenPropertyCreBysort: !this.state.GreenPropertyCreBysort,
            GreenPropertiesList: this.state.GreenPropertiesList.sort((a, b) =>
              a.createdBy > b.createdBy ? 1 : -1
            )
          });
        } else {
          await this.setState({
            GreenPropertyCreBysort: !this.state.GreenPropertyCreBysort,
            GreenPropertiesList: this.state.GreenPropertiesList.sort((a, b) =>
              a.createdBy < b.createdBy ? 1 : -1
            )
          });
    } 
    break;
    case "ModifiedBy" :
          const arrModiby = this.state.GreenPropertiesList.filter(el => {
            return el.modifiedBy != null && el.modifiedBy != ''
           });
           const arrModibynull = this.state.GreenPropertiesList.filter(el => {
            return el.modifiedBy === null 
           });
          if (this.state.GreenPropertyModiBysort) {
          await this.setState({
              GreenPropertyModiBysort: !this.state.GreenPropertyModiBysort,
              GreenPropertiesList: arrModiby.sort((a, b) =>
                a.modifiedBy > b.modifiedBy ? 1 : -1
              )
            });
            await this.setState({ GreenPropertiesList: [...this.state.GreenPropertiesList, ...arrModibynull] });
          } else {
            await this.setState({
              GreenPropertyModiBysort: !this.state.GreenPropertyModiBysort,
              GreenPropertiesList: arrModiby.sort((a, b) =>
                a.modifiedBy < b.modifiedBy ? 1 : -1
              )
            });
            await this.setState({ GreenPropertiesList: [...arrModibynull, ...this.state.GreenPropertiesList] });
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
    if (this.state.GreenPropertiesForm.GreenProperties.value === "") {
      this.setState({
        isValid: false,
        errorMessage: "Green Property name is mandatory"
      });
    } else {
      this.setState({ isValid: true });
    }
  }
  async upsertGreenProperties(event) {
    this.setState({ loading: true });
    event.preventDefault();
    const updatedGreenPropertiesForm = {
      ...this.state.GreenPropertiesForm
    };
    await this.validateForm();
    if (this.state.isValid) {
      if (this.state.selectedFileIcon !== null) {
        await this.uploadImage();
      }
      if(this.state.imageUploadError === null){
        const formData = {
          GreenPropertyGuid: this.state.SubmitButton.toUpperCase() === "ADD" ? "00000000-0000-0000-0000-000000000000" : this.state.GreenPropertiesGuid,
          GreenPropertyName: updatedGreenPropertiesForm.GreenProperties.value,
          LanguageGuid: localStorage.getItem("languageId"),
          IsActive: 1,
          CreatedBy: localStorage.getItem("userId"),
          ModifiedBy: localStorage.getItem("userId"),
          WebsiteGuid: getWebsiteGUID(),
          Action: this.state.SubmitButton.toUpperCase(),
          OldValuesXML: JSON.stringify(this.state.oldValues),
          NewValuesXML: JSON.stringify(this.state.newValues),
          PageName: window.location.href,
          IconName:this.state.GreenPropertiesIcon
        };
        var config = {
          headers: {
            Authorization: "Bearer " + localStorage.tokenId,
            "Content-Type": "application/json"
          }
        };
      await axios.post(getServiceUrl() + "MasterData/InsertOrUpdateGreenProperties", formData, config)
        .then(response => {
          this.getAllGreenPropertiesList("");
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
  }

  async deleteGreenPropertiesConfirmation(greenPropertyGuid, IconName, action) {
    confirmAlert({
      message: "Are you sure?",
      buttons: [
        {
          label: "Yes",
          onClick: () => this.deleteGreenProperties(greenPropertyGuid, IconName, action)
        },
        {
          label: "No"
        }
      ]
    });
  }

  async deleteGreenProperties(greenPropertyGuid, IconName, action) {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        "GreenPropertyGuid":greenPropertyGuid,
        "IconName":IconName
      }
    };
    await axios
      .get(getServiceUrl() + "MasterData/DeleteGreenProperty", config
      )
      .then(response => {
        this.getAllGreenPropertiesList("");
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
    const updatedGreenPropertiesForm = {
      ...this.state.GreenPropertiesForm
    };

    const updatedFormElement = {
      ...updatedGreenPropertiesForm[inputIdentifier]
    };

    updatedFormElement.value = event.target.value;

    updatedGreenPropertiesForm[inputIdentifier] = updatedFormElement;
    if(inputIdentifier === "GreenProperties"){
      if (!this.state.paste) {
        if (this.state.alphaNumericOnly) {
          if (
            event.target.value.length <= updatedFormElement.validation.maxLength
          ) {
            this.setState({
              GreenPropertiesForm: updatedGreenPropertiesForm,
              newValues: updatedGreenPropertiesForm
            });
          }
        }
      }
    }
    
    if (inputIdentifier === "GreenpropertyIcon") {
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
            GreenPropertiesIcon: null
          });
        } else {
          this.setState({
            GreenPropertiesForm: updatedGreenPropertiesForm,
            newValues: updatedGreenPropertiesForm,
            selectedFileIcon:
              event.target.files !== undefined ? event.target.files[0] : null,
              GreenPropertiesIcon:
              event.target.files !== undefined ? null : this.state.GreenPropertiesIcon
          });
        }
    }

  };

  editForm = (greenPropertyName, iconName, greenPropertiesGuid) => {
    document.documentElement.scrollTop = 0;
    const updatedGreenPropertiesForm = {
      ...this.state.GreenPropertiesForm
    };

    const GreenPropertiesNameElement = {
      ...updatedGreenPropertiesForm["GreenProperties"]
    };

    GreenPropertiesNameElement.value = greenPropertyName;

    updatedGreenPropertiesForm["GreenProperties"] = GreenPropertiesNameElement;

    this.setState({
      GreenPropertiesForm: updatedGreenPropertiesForm,
      oldValues: updatedGreenPropertiesForm,
      SubmitButton: "Update",
      GreenPropertiesGuid: greenPropertiesGuid,
      GreenPropertiesIcon: iconName
    });
  };
  resetForm() {
    const updatedGreenPropertiesForm = {
      ...this.state.GreenPropertiesForm
    };

    const GreenPropertiesNameElement = {
      ...updatedGreenPropertiesForm["GreenProperties"]
    };

    GreenPropertiesNameElement.value = "";

    updatedGreenPropertiesForm["GreenProperties"] = GreenPropertiesNameElement;

    this.setState({
      GreenPropertiesForm: updatedGreenPropertiesForm,
      SubmitButton: "Add",
      GreenPropertiesGuid: null,
      GreenPropertiesIcon: null,
      selectedFileIcon: null
    });
  }
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
          UploadType: "GreenPropertyIcon"
        }
      };
      // await axios
      //   .post(getServiceUrl() + "FileUpload/uploadfile", formData, config)
      //   .then(response => {
      //     if (response.data.indexOf("dimensions") === -1) {
      //       this.setState({
      //         GreenPropertiesIcon: response.data,
      //         imageUploadError: null,
      //         imageUploaded: true
      //       });
      //     } else {
      //       this.setState({ imageUploadError: response.data, imageUploaded: false });
      //     }
      //     //document.getElementById("fie-upload-message").innerHTML = 'Drag your files here or click in this area.';
      //   });
    } else {
      this.setState({ imageUploadError: "Please select a valid Image file." });
    }
  }
  render() {
    let defaultBannerUrl = getAWSUrl() + "CategoryImages/default.png";
    let formElementsArray = [];
    for (let key in this.state.GreenPropertiesForm) {
      formElementsArray.push({
        id: key,
        config: this.state.GreenPropertiesForm[key]
      });
    }
    let imagePreview = null;
    if (this.state.GreenPropertiesIcon !== null) {
      imagePreview =  getAWSUrl() + "GreenPropertiesIcons/" + this.state.GreenPropertiesIcon
     } 
   else if (this.state.selectedFileIcon !== null) {
      imagePreview = URL.createObjectURL(this.state.selectedFileIcon)
    }
   
    let GreenPropertiesList = this.state.GreenPropertiesList.map(item => (
        
      <React.Fragment>
        <tr>
          <td>
            <p>{item.greenPropertyName}</p>
          </td>
          <td>
            <div className="cate_image">
              <img
                src={ 
                  item.iconName === null
                    ? defaultBannerUrl
                    : getAWSUrl() +
                    "GreenPropertiesIcons/" +
                    item.iconName
                 
                }
                onError={e => {
                  e.target.src = getAWSUrl() + "CategoryImages/default.png"; // some replacement image
                }}
              />
            </div>
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
            <div className="category_details3">
              <div>
                <Edit
                  onClick={event =>
                    this.editForm(
                      item.greenPropertyName,
                      item.iconName,
                      item.greenPropertyGuid
                    )
                  }
                />
                <Delete
                  data-tip
                  data-for="error2"
                  onClick={() =>
                    this.deleteGreenPropertiesConfirmation(
                      item.greenPropertyGuid,
                      item.iconName,
                      "DELETEGreenProperties"
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
      <div className="CategoryManagement GreenPropertiesManag ">
        <div className="cm_outer">
          <div className="cm_header">
            <h6>
              <Sort />
              Add/Edit green properties
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
                    onClick={event => this.upsertGreenProperties(event)}
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
                        value={this.state.searchGreenProperties}
                      />
                    </div>
                  </div>
                </GridItem>
                <GridItem md={8} xs={12}>
                  <div>
                    <Button
                      outlineBtnNew
                      onClick={() =>
                        this.getAllGreenPropertiesList(this.state.searchGreenProperties)
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
                      <th onClick={() => this.sortGreenProperty("Name")}>
                        <div className="sort_category">
                          Green properties name
                          {this.state.GreenPropertyNamesort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th>Icon Name</th>
                      <th onClick={() => this.sortGreenProperty("CreatedOn")}>
                        <div className="sort_category">
                           Created On
                          {this.state.GreenPropertyCreDatesort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortGreenProperty("CreatedBy")}>
                        <div className="sort_category">
                          Created By
                          {this.state.GreenPropertyCreBysort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortGreenProperty("ModifiedOn")}>
                        <div className="sort_category">
                          Modified On
                          {this.state.GreenPropertyModiDatesort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortGreenProperty("ModifiedBy")}>
                        <div className="sort_category">
                          Modified By
                          {this.state.GreenPropertyModiBysort ? <ExpandMore /> : <ExpandLess />}
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
                    ) : GreenPropertiesList.length > 0 ? (
                      GreenPropertiesList
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
export default GreenPropertiesManagement;