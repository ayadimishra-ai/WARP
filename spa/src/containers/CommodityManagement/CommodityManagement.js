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
import { getServiceUrl,getWebsiteUrl,getAWSUrl, getWebsiteGUID } from "../../config";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import { getAllCommodityList } from "../../utility";
import Spinner from "../../UI/Spinner/Spinner";
const awsUrl = getWebsiteUrl();
const initialState = {
  commodityForm: {
    commodity: {
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
      label: "Commodity *"
    },
    isArtwork: {
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
      checkBoxLabel: 'Is artwork applicable',
      checked: false
  },
  file2: {
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
    touched: false,
    fileLabel:'Commodity icon'
  },
  },
  isValid: false,
  errorMessage: "",
  loading: false,
  SubmitButton: "Add",
  commodityList: [],
  commodityGuid: null,
  oldValues: [],
  newValues: [],
  searchCommodity: "",
  alphaNumericOnly: true,
  paste: false,
  sort: true,
  selectedFileIcon: null,
  selectedFileIconName: null,
  CommodityIcon: null,
  imageUploadError: null,
  isArtworksort: true,
  createdOnsort:true,
  createdBysort:true,
  modifiedOnsort:true,
  modifiedBysort:true
};

class CommodityManagement extends Component {
  state = { ...initialState }; // use spread operator to avoid mutation

  constructor(props) {
    super(props);
  }
  handleChange(checked) {
    this.setState({ checked });
  }
  async componentDidMount() {
    this.getAllCommodityList("");
  }
  changeSearch(event) {
    this.setState({ searchCommodity: event.target.value });
  }
  resetSearch() {
    this.getAllCommodityList("");
    this.setState({ searchCommodity: "" });
  }
  getAllCommodityList(searchCommodity) {
    this.setState({
      loading: true
    });
    getAllCommodityList(searchCommodity)
      .then(commodityList => {
        this.setState({
          commodityList: commodityList,
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
  sortCommodity() {
    if (this.state.sort) {
      this.setState({
        sort: !this.state.sort,
        isArtworksort:true,
        createdOnsort:true,
        createdBysort:true,
        modifiedOnsort:true,
        modifiedBysort:true,
        commodityList: this.state.commodityList.sort((a, b) =>
          a.commodityName > b.commodityName ? 1 : -1
        )
      });
    } else {
      this.setState({
        sort: !this.state.sort,
        isArtworksort:true,
        createdOnsort:true,
        createdBysort:true,
        modifiedOnsort:true,
        modifiedBysort:true,
        commodityList: this.state.commodityList.sort((a, b) =>
          a.commodityName < b.commodityName ? 1 : -1
        )
      });
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
    if (this.state.commodityForm.commodity.value === "") {
      this.setState({
        isValid: false,
        errorMessage: "Commodity name is mandatory"
      });
    } else {
      this.setState({ isValid: true });
    }
  }
  async upsertCommodity(event) {
    this.setState({ loading: true });
    event.preventDefault();
    const updatedCommodityForm = {
      ...this.state.commodityForm
    };
    await this.validateForm();
    if (this.state.isValid) {
      if (this.state.selectedFileIcon !== null) {
        await this.uploadImage();
      }
      if(this.state.imageUploadError === null){
      const formData = {
        CommodityGuid: this.state.CommodityGuid,
        CommodityName: updatedCommodityForm.commodity.value,
        LanguageGuid: localStorage.getItem("languageId"),
        IsActive: 1,
        UserGuid: localStorage.getItem("userId"),
        WebsiteGuid: getWebsiteGUID(),
        Action: this.state.SubmitButton.toUpperCase(),
        OldValuesXML: JSON.stringify(this.state.oldValues),
        NewValuesXML: JSON.stringify(this.state.newValues),
        PageName: window.location.href,
        CommodityIcon:this.state.selectedFileIconName,
        IsArtworkApplicable:updatedCommodityForm.isArtwork.checked
      };
      var config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "application/json"
        }
      };
      await axios
        .post(getServiceUrl() + "Commodity/UpsertCommodity", formData, config)
        .then(response => {
          this.getAllCommodityList("");
          this.resetForm();
          this.setState({ loading: false });
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
  }else {
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

  async deleteCommodityConfirmation(commodityGuid, isActive, action,commodityIcon) {
    confirmAlert({
      message: "Are you sure?",
      buttons: [
        {
          label: "Yes",
          onClick: () => this.deleteCommodity(commodityGuid, isActive, action,commodityIcon)
        },
        {
          label: "No"
        }
      ]
    });
  }

  async deleteCommodity(commodityGuid, isActive, action,commodityIcon) {
    const formData = {
      CommodityGuid: commodityGuid,
      IsActive: !isActive,
      UserGuid: localStorage.getItem("userId"),
      Action: action.toUpperCase(),
      OldValuesXML: commodityGuid,
      NewValuesXML: "Deleted",
      PageName: window.location.href,
      CommodityIcon:commodityIcon
    };
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json"
      }
    };
    await axios
      .post(
        getServiceUrl() + "Commodity/ChangeCommodityStatus",
        formData,
        config
      )
      .then(response => {
        this.getAllCommodityList("");
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

  async ChangeCommodityStatus(commodityGuid, isActive, action) {
    const formData = {
      CommodityGuid: commodityGuid,
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
      .post(
        getServiceUrl() + "Commodity/ChangeCommodityStatus",
        formData,
        config
      )
      .then(response => {
        this.getAllCommodityList("");
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

  ChangeHandler = (event, inputIdentifier) => {
    const updatedCommodityForm = {
      ...this.state.commodityForm
    };

    const updatedFormElement = {
      ...updatedCommodityForm[inputIdentifier]
    };

    updatedFormElement.value = event.target.value;
    updatedCommodityForm[inputIdentifier] = updatedFormElement;
    if(inputIdentifier=="commodity"){
    if (!this.state.paste) {
      if (this.state.alphaNumericOnly) {
        if (
          event.target.value.length <= updatedFormElement.validation.maxLength
        ) {
          this.setState({
            commodityForm: updatedCommodityForm,
            newValues: updatedCommodityForm
          });
        }
      }
    }
    }
    if(inputIdentifier=="isArtwork")
    {
      
      if(updatedCommodityForm.isArtwork.checked)
      {
        updatedFormElement.checked=false;
      }
      else{
        updatedFormElement.checked=true;
      }
      updatedCommodityForm[inputIdentifier] = updatedFormElement;
      this.setState({
        commodityForm: updatedCommodityForm
      });
    }
    if (inputIdentifier === "file2") {
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
          CommodityIcon: null
        });
      } else {
        this.setState({
          commodityForm: updatedCommodityForm,
          newValues: updatedCommodityForm,
          selectedFileIcon:
            event.target.files !== undefined ? event.target.files[0] : null,
          CommodityIcon:
            event.target.files !== undefined ? null : this.state.CommodityIcon
        });
      }
    }
  };

 async editForm (commodityName, commodityImage, commodityGuid,commodityIcon, isArtworkApplicable) {
    document.documentElement.scrollTop = 0;
    const updatedCommodityForm = {
      ...this.state.commodityForm
    };

    const commodityNameElement = {
      ...updatedCommodityForm["commodity"]
    };
    const isArtworkElement = {
      ...updatedCommodityForm["isArtwork"]
    };

    commodityNameElement.value = commodityName;
    isArtworkElement.checked = isArtworkApplicable;

    updatedCommodityForm["commodity"] = commodityNameElement;
    updatedCommodityForm["isArtwork"]=isArtworkElement;
    this.setState({
      commodityForm: updatedCommodityForm,
      oldValues: updatedCommodityForm,
      SubmitButton: "Update",
      CommodityGuid:commodityGuid,
      CommodityImage:commodityImage,
      CommodityIcon:commodityIcon,
     // selectedFileIcon:CommodityIcon
    });
    
   
  };
  async resetForm() {
    const updatedCommodityForm = {
      ...this.state.commodityForm
    };

    const commodityNameElement = {
      ...updatedCommodityForm["commodity"]
    };
    const isArtwokrElement = {
      ...updatedCommodityForm["isArtwork"]
    };

    commodityNameElement.value = "";
    isArtwokrElement.checked = false;

    updatedCommodityForm["commodity"] = commodityNameElement;
    updatedCommodityForm["isArtwork"] = isArtwokrElement;

    this.setState({
      commodityForm: updatedCommodityForm,
      SubmitButton: "Add",
      CommodityGuid: null,
      CommodityImage: null,
      CommodityIcon: null,
      selectedFileIcon:null
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
          UploadType: "CommodityIcon"
        }
      };
      // await axios
      //   .post(getServiceUrl() + "FileUpload/uploadfile", formData, config)
      //   .then(response => {
      //     if (response.data.indexOf("dimensions") === -1) {
      //       this.setState({
      //         selectedFileIconName: response.data,
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
  sortIsArtwork() {
    if (this.state.isArtworksort) {
      this.setState({
        isArtworksort: !this.state.isArtworksort,
        sort: true,
        createdOnsort:true,
        createdBysort:true,
        modifiedOnsort:true,
        modifiedBysort:true,
        commodityList: this.state.commodityList.sort((a, b) =>
          a.isArtworkApplicable > b.isArtworkApplicable ? 1 : -1
        )
      });
    } else {
      this.setState({
        isArtworksort: !this.state.isArtworksort,
        sort: true,
        createdOnsort:true,
        createdBysort:true,
        modifiedOnsort:true,
        modifiedBysort:true,
        commodityList: this.state.commodityList.sort((a, b) =>
          a.isArtworkApplicable < b.isArtworkApplicable ? 1 : -1
        )
      });
    }
  }
  sortCreatedOn() {
    if (this.state.createdOnsort) {
      this.setState({
        createdOnsort: !this.state.createdOnsort,
        isArtworksort: true,
        sort:true,
        createdBysort:true,
        modifiedOnsort:true,
        modifiedBysort:true,
        commodityList: this.state.commodityList.sort((a, b) =>
          a.createdOn > b.createdOn ? 1 : -1
        )
       
      });
    } else {
      this.setState({
        createdOnsort: !this.state.createdOnsort,
        isArtworksort: true,
        sort:true,
        createdBysort:true,
        modifiedOnsort:true,
        modifiedBysort:true,
        commodityList: this.state.commodityList.sort((a, b) =>
          a.createdOn < b.createdOn ? 1 : -1
        )
      });
    }
  }
  sortCreatedBy() {
    if (this.state.createdBysort) {
      this.setState({
        createdBysort: !this.state.createdBysort,
        isArtworksort: true,
        createdOnsort:true,
        sort:true,
        modifiedOnsort:true,
        modifiedBysort:true,
        commodityList: this.state.commodityList.sort((a, b) =>
          a.createdBy > b.createdBy ? 1 : -1
        )
      });
    } else {
      this.setState({
        createdBysort: !this.state.createdBysort,
        isArtworksort: true,
        createdOnsort:true,
        sort:true,
        modifiedOnsort:true,
        modifiedBysort:true,
        commodityList: this.state.commodityList.sort((a, b) =>
          a.createdBy < b.createdBy ? 1 : -1
        )
      });
    }
  }
  async sortModifiedBy() {
    const arrModiBy = this.state.commodityList.filter(el => {
      return el.modifiedBy != null && el.modifiedBy != ''
     });
     const arrModiBynull = this.state.commodityList.filter(el => {
      return el.modifiedBy === null 
     });
    if (this.state.modifiedBysort) {
      await this.setState({
        modifiedBysort: !this.state.modifiedBysort,
        isArtworksort: true,
        createdOnsort:true,
        createdBysort:true,
        modifiedOnsort:true,
        sort:true,
        commodityList: arrModiBy.sort((a, b) =>
          a.modifiedBy > b.modifiedBy ? 1 : -1
        )
      });
      await this.setState({ commodityList: [ ...this.state.commodityList, ...arrModiBynull,] });
    } else {
     await this.setState({
        modifiedBysort: !this.state.modifiedBysort,
        isArtworksort: true,
        createdOnsort:true,
        createdBysort:true,
        modifiedOnsort:true,
        sort:true,
        commodityList: arrModiBy.sort((a, b) =>
          a.modifiedBy < b.modifiedBy ? 1 : -1
        )
      });
      await this.setState({ commodityList: [...arrModiBynull,  ...this.state.commodityList] });
    }
  }
 async sortModifiedOn() {
    const arrModiDate = this.state.commodityList.filter(el => {
      return el.modifiedOn != null && el.modifiedOn != ''
     });
     const arrModiDatenull = this.state.commodityList.filter(el => {
      return el.modifiedOn === null 
     });
    if (this.state.modifiedOnsort) {
     await this.setState({
        modifiedOnsort: !this.state.modifiedOnsort,
        isArtworksort: true,
        createdOnsort:true,
        createdBysort:true,
        sort:true,
        modifiedBysort:true,
        commodityList: arrModiDate.sort((a, b) =>
          a.modifiedOn > b.modifiedOn ? 1 : -1
        )
      });
      await this.setState({ commodityList: [...this.state.commodityList, ...arrModiDatenull] });
    } else {
     await this.setState({
        modifiedOnsort: !this.state.modifiedOnsort,
        isArtworksort: true,
        createdOnsort:true,
        createdBysort:true,
        sort:true,
        modifiedBysort:true,
        commodityList: arrModiDate.sort((a, b) =>
          a.modifiedOn < b.modifiedOn ? 1 : -1
        )
      });
      await this.setState({ commodityList: [ ...arrModiDatenull,  ...this.state.commodityList] });
    }
  }
  render() {
    let formElementsArray = [];
   // let defaultBannerUrl = getAWSUrl() + "CategoryImages/default.png";
    
    for (let key in this.state.commodityForm) {
      formElementsArray.push({
        id: key,
        config: this.state.commodityForm[key]
      });
    }
    let imagePreview = null;
    if (this.state.CommodityIcon !== null) {
      imagePreview =  getAWSUrl() + "CommodityIcons/" + this.state.CommodityIcon
    } else if (this.state.selectedFileIcon !== null) {
      imagePreview = URL.createObjectURL(this.state.selectedFileIcon)
    }
    let commodityList = this.state.commodityList.map(item => (
      <React.Fragment>
        <tr>
          <td>
            <p>{item.commodityName}</p>
          </td>
          <td>
          <p>{item.isArtworkApplicable ? "Yes" : "No"}</p>
           </td>
         <td>
         <div className="cate_image">
        <img alt=" " src={awsUrl+"CommodityIcons/"+item.commodityIcon}  onError={(e) => { e.target.onerror = null; e.target.src = awsUrl +"ProductImages/Thumbnail/default.jpg" }} />
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
                      item.commodityName,
                      item.commodityImage,
                      item.commodityGuid,
                      item.commodityIcon,
                      item.isArtworkApplicable
                    )
                  }
                />
                <Delete
                  data-tip
                  data-for="error2"
                  onClick={() =>
                    this.deleteCommodityConfirmation(
                      item.commodityGuid,
                      item.isActive,
                      "DELETECOMMODITY",
                      item.commodityIcon,
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
              Add/Edit Commodity
            </h6>
          </div>
          <div className="category_form">
            <GridContainer>
              {formElementsArray.map(formElement => (
                <GridItem key={formElement.id} md={formElement.config.elementType === 'file' ? 6 : 4} xs={12}>
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
                      onClickd={event => this.ChangeHandler(event, formElement.id)}
                      checked={formElement.config.checked}
                      file={imagePreview}
                    />
                  </div>
                </GridItem>
              ))}
              <GridItem md={4} xs={12}>
                <div style={{display:'flex',alignItems:'flex-end',height:'100%',marginTop:'-25px'}} className="management_actions">
                  <Button
                    outlineBtnNew
                    onClick={event => this.upsertCommodity(event)}
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
                        value={this.state.searchCommodity}
                      />
                    </div>
                  </div>
                </GridItem>
                <GridItem md={8} xs={12}>
                  <div>
                    <Button
                      outlineBtnNew
                      onClick={() =>
                        this.getAllCommodityList(this.state.searchCommodity)
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
                      <th onClick={() => this.sortCommodity()}>
                      <div className="sort_category">
                      Commodity Name
                          {this.state.sort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                      </th>
                      <th onClick={() => this.sortIsArtwork()}>
                      <div className="sort_category">
                      Is Artwork Applicable
                        {this.state.isArtworksort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                        </th>
                      <th>Commodity Icon</th>
                      <th onClick={() => this.sortCreatedOn()}>
                      <div className="sort_category">
                      Created On
                        {this.state.createdOnsort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                        </th>
                        <th onClick={() => this.sortCreatedBy()}>
                      <div className="sort_category">
                      Created By
                        {this.state.createdBysort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                        </th>
                        <th onClick={() => this.sortModifiedOn()}>
                      <div className="sort_category">
                      Modified On
                        {this.state.modifiedOnsort ? <ExpandMore /> : <ExpandLess />}
                        </div>
                        </th>
                        <th onClick={() => this.sortModifiedBy()}>
                      <div className="sort_category">
                      Modified By
                        {this.state.modifiedBysort ? <ExpandMore /> : <ExpandLess />}
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
                    ) : commodityList.length > 0 ? (
                      commodityList
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
export default CommodityManagement;


