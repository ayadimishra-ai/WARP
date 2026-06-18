 
import axios from "axios";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import toaster from "toasted-notes";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import {
  getFileExtension, getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getUserPermision, getWebsiteUrl
} from "../../config";
import * as PageKeys from "../../pagekeys";
import * as RoleCodes from "../../rolecodes";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import Spinner from "../../UI/Spinner/Spinner";
import { getLanguageList, getPageResource, toasterAlert } from "../../utility";

const initialState = {
  uploadForm: {
    file: {
      elementType: "input",
      elementConfig: {
        type: "file"
      },
      validation: {
        required: true
      },
      errorMessage: "Please select a .xlsx file.",
      valid: false,
      touched: false
    },
  },
  // uploadFormDropdowns: {

  //   language: {
  //     elementType: "select",
  //     elementConfig: {
  //       type: "select",
  //       options: [],
  //       label: "Select Language",
  //       value: ""
  //     },
  //     validation: {
  //       required: true
  //     },
  //     errorMessage: "Please select a language.",
  //     valid: false,
  //     touched: false
  //   },
  //   supplier: {
  //     elementType: "select",
  //     elementConfig: {
  //       type: "select",
  //       options: [],
  //       label: "Select Supplier",
  //       value: ""
  //     },
  //     validation: {
  //       required: true
  //     },
  //     errorMessage: "Please select supplier.",
  //     valid: false,
  //     touched: false
  //   },
  // },
  formIsValid: false,
  selectedFile: null,
  loading: true,
  resources: [],
  languageList: [],
  selectedLanguage: "0",
  selectedSupplierCompanyName: "0",
  supplierCompanyList: [],
};
class ImportPartner extends Component {
  state = { ...initialState }; // use spread operator to avoid mutation

  downloadProductTemplate() {
    var link = document.createElement("a");
    link.download = "PartnerTemplate.xlsx";
    link.href = getWebsiteUrl() + "PartnerTemplate.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  stateResetHandler() {
    this.setState(this.initialState);

    const updatedUploadFormInfo = {
      ...this.state.uploadForm
    };
    updatedUploadFormInfo.file.touched = false;
    this.setState({
      uploadForm: updatedUploadFormInfo,
      loading: false
    });
    this.languageList();

    const updatedUploadFormDropdownInfo = {
      ...this.state.uploadFormDropdowns
    };
    if (this.props.userType === RoleCodes.SUPPLIERSUPPORTPERSON) {
      const updatedUploadFormDropdownInfo = { ...this.state.uploadFormDropdowns };
      updatedUploadFormDropdownInfo.supplier.valid = false;
      updatedUploadFormDropdownInfo.supplier.touched = false;
      this.setState({ uploadFormDropdowns: updatedUploadFormDropdownInfo });
      this.getSupplierCompanyList();
    } else if (this.props.userType === RoleCodes.SUPPLIER) {
      const updatedUploadFormDropdownInfo = { ...this.state.uploadFormDropdowns };
      updatedUploadFormDropdownInfo.supplier.valid = true;
      updatedUploadFormDropdownInfo.supplier.touched = true;
      this.setState({ uploadFormDropdowns: updatedUploadFormDropdownInfo });
    }
    //this.setState({ loading: false });
  }

  languageList() {
    const updatedUploadFormDropdownInfo = {
      ...this.state.uploadFormDropdowns
    };
    getLanguageList()
      .then(languageList => {
        updatedUploadFormDropdownInfo.language.elementConfig.options = languageList;

        if (languageList.length === 1) {
          updatedUploadFormDropdownInfo.language.value = languageList[0].Id;
          updatedUploadFormDropdownInfo.language.valid = true;
          updatedUploadFormDropdownInfo.language.touched = true;
        }
        this.setState({
          uploadFormDropdowns: updatedUploadFormDropdownInfo,
          selectedLanguage: updatedUploadFormDropdownInfo.language.value,
          loading: false,
          languageList: languageList
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
  componentWillMount() {
    this.initialState = this.state;
  }
  componentDidMount = () => {
    
    this.stateResetHandler();

    getPageResource(
      getLanguageResourceElasticIndex(this.props.languageId, "importexport")
    )
      .then(json => {
        this.setState({ resources: json });
      })
      .catch(err =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/logout")
            : ""
          : ""
      );
  };
  checkSelectValidity(value, rules) {
    let isValid = true;
    if (rules.required) {
      isValid = value.trim() !== "0";
    }
    return isValid;
  }
  checkValidity(value, rules) {
    let isValid = true;
    if (rules.required) {
      isValid = value.trim() !== "" && getFileExtension(value) === "xlsx";
    }
    return isValid;
  }
  onLanguageChangeHandler = (event, inputIdentifier) => {
    const updatedUploadFormDropdownInfo = {
      ...this.state.uploadFormDropdowns
    };
    const updatedFormElement = {
      ...updatedUploadFormDropdownInfo[inputIdentifier]
    };
    updatedFormElement.value = event.target.value;
    updatedFormElement.valid = this.checkSelectValidity(
      updatedFormElement.value,
      updatedFormElement.validation
    );
    updatedFormElement.touched = true;
    updatedUploadFormDropdownInfo[inputIdentifier] = updatedFormElement;

    let formIsValid = true;

    for (let inputIndentifiers in updatedUploadFormDropdownInfo) {
      formIsValid =
        updatedUploadFormDropdownInfo[inputIndentifiers].valid &&
        formIsValid &&
        this.state.selectedLanguage === "0";
    }
    this.setState({
      uploadFormDropdowns: updatedUploadFormDropdownInfo,
      formIsValid: formIsValid,
      selectedLanguage: event.target.value
    });
  };
  fileSelectedHandler = (event, inputIdentifier) => {
    const updatedUploadForm = {
      ...this.state.uploadForm
    };
    const updatedFormElement = {
      ...updatedUploadForm[inputIdentifier]
    };
    updatedFormElement.value = event.target.value;
    updatedFormElement.valid = this.checkValidity(
      updatedFormElement.value,
      updatedFormElement.validation
    );

    updatedUploadForm[inputIdentifier] = updatedFormElement;

    let formIsValid = true;

    for (let inputIndentifiers in updatedUploadForm) {
      formIsValid = updatedUploadForm[inputIndentifiers].valid && formIsValid;
    }
    this.setState({
      uploadForm: updatedUploadForm,
      formIsValid: formIsValid,
      selectedFile: event.target.files[0]
    });
    if (event.target.files[0] !== undefined) {
      document.getElementById("fie-upload-message").innerHTML =
        event.target.files[0].name;
    } else {
      document.getElementById("fie-upload-message").innerHTML =
        "Drag your files here or click in this area.";
    }
  };
  submitHandler = async(event) => {
    event.preventDefault();
    let userId = null;
    if (this.props.userType === RoleCodes.SUPPLIERSUPPORTPERSON) {
      userId = this.state.selectedSupplierCompanyName
    } else {
      userId = this.props.userId;
    }
    const formData = new FormData();
    let formIsValid = this.checkFormValidity();
    //if (this.state.formIsValid) {
    if (formIsValid) {
      this.setState({ loading: true });
      formData.append(
        "files",
        this.state.selectedFile,
        this.state.selectedFile.name
      );

      var config = {
        headers: {
          "Authorization": "Bearer " + localStorage.tokenId,
          'Content-Type': "multipart/form-data",
          'UploadType': "ImportComapniesExcel",
          'LanguageGuid':localStorage.languageId,
          'UserGuid':localStorage.userId,
          'LoggedInUserGuid':localStorage.userId
        }
      };
      // await axios.post(getServiceUrl() + "FileUpload/uploadfile",formData,config)
      //   .then(response => {
      //     if (response.data.saveresult === "success") {
      //       this.setState({ loading: false });
      //       let url = response.data.ErrorPath;
      //       const link = document.createElement("a");
      //       link.setAttribute("href", url);
      //       link.setAttribute("download", "PartnerImported.xlsx");
      //       document.body.appendChild(link);
      //       link.target = "_blank";
      //       link.click();
      //       document.body.removeChild(link);
      //       toaster.notify(toasterAlert("SUCCESS", "Partners are imported successfully"),
      //         {
      //           duration: null
      //         }
      //       );
      //     } else {
      //       this.setState({ loading: false });
      //       //alert(response.data.saveresult);
      //       let url = response.data.ErrorPath;
      //       const link = document.createElement("a");
      //       link.setAttribute("href", url);
      //       link.setAttribute("download", "PartnerImported.xlsx");
      //       document.body.appendChild(link);
      //       link.target = "_blank";
      //       link.click();
      //       document.body.removeChild(link);
      //       toaster.notify(toasterAlert("FAIL", response.data.saveresult), {
      //         duration: null
      //       });
      //     }
      //     this.stateResetHandler();
      //     //document.getElementById("fie-upload-message").innerHTML = 'Drag your files here or click in this area.';
      //   }).catch((error)=>{
      //     console.log("error",error);
      //     this.setState({ loading: false });
      //   });
    } else {
      const updatedUploadForm = {
        ...this.state.uploadForm
      };
      for (let inputIndentifiers in updatedUploadForm) {
        updatedUploadForm[inputIndentifiers].touched = !updatedUploadForm[
          inputIndentifiers
        ].valid;
      }
      this.setState({
        uploadForm: updatedUploadForm
      });

      const updatedUploadFormDropdownInfo = {
        ...this.state.uploadFormDropdowns
      };
      for (let inputIndentifiers in updatedUploadFormDropdownInfo) {
        updatedUploadFormDropdownInfo[inputIndentifiers].touched = !updatedUploadFormDropdownInfo[
          inputIndentifiers
        ].valid;
      }
      this.setState({
        uploadFormDropdowns: updatedUploadFormDropdownInfo
      });
    }
  };
  onSupplierChangeHandler = (event, inputIdentifier) => {
    const updatedUploadFormDropdownInfo = {
      ...this.state.uploadFormDropdowns
    };
    const updatedFormElement = {
      ...updatedUploadFormDropdownInfo[inputIdentifier]
    };
    updatedFormElement.value = event.target.value;
    updatedFormElement.valid = this.checkSelectValidity(
      updatedFormElement.value,
      updatedFormElement.validation
    );
    updatedFormElement.touched = true;
    updatedUploadFormDropdownInfo[inputIdentifier] = updatedFormElement;

    let formIsValid = true;
    let aa = this.state.selectedSupplierCompanyName;
    for (let inputIndentifiers in updatedUploadFormDropdownInfo) {
      formIsValid =
        updatedUploadFormDropdownInfo[inputIndentifiers].valid &&
        formIsValid; //&& this.state.selectedSupplierCompanyName === "0";
    }
    this.setState({
      uploadFormDropdowns: updatedUploadFormDropdownInfo,
      formIsValid: formIsValid,
      selectedSupplierCompanyName: event.target.value
    });
  };

  getSupplierCompanyList = () => {
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
          response.data.table1.filter(x => x.isActive === true).map(item => {
            list.push({
              Id: item.userGuid,
              Value: item.supplierCompanyName
            })
          })
          const updatedUploadFormDropdownInfo = { ...this.state.uploadFormDropdowns };
          updatedUploadFormDropdownInfo.supplier.elementConfig.options = list;
          if (list.length === 1) {
            updatedUploadFormDropdownInfo.supplier.value = list[0].Id;
            updatedUploadFormDropdownInfo.supplier.valid = true;
            updatedUploadFormDropdownInfo.supplier.touched = true;
          }
          this.setState({
            uploadFormDropdowns: updatedUploadFormDropdownInfo,
            selectedSupplierCompanyName: updatedUploadFormDropdownInfo.supplier.value,
            loading: false,
            supplierCompanyList: list
          });
        }
      }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');
  }

  checkFormValidity = () => {
    let formIsValid = true;
    const updatedUploadFormDropdownInfo = { ...this.state.uploadFormDropdowns };
    for (let inputIndentifiers in updatedUploadFormDropdownInfo) {
      formIsValid =
        updatedUploadFormDropdownInfo[inputIndentifiers].valid && formIsValid;
    }

    const updatedUploadForm = { ...this.state.uploadForm };
    for (let inputIndentifiers in updatedUploadForm) {
      formIsValid = updatedUploadForm[inputIndentifiers].valid && formIsValid;
    }
    return formIsValid;
  }
  render() {
    let permissions = localStorage.permissions !== undefined? JSON.parse(localStorage.permissions):[];
        if(permissions.length === 0){
            return <Redirect to="/not-found" />;
        }else if(getUserPermision(permissions, PageKeys.importpartner) === null)
        {
            return <Redirect to="/not-found" />;
        }
    let pageBody = <Spinner />;
    // if (
    //   getUserPermision(this.props.permissions, PageKeys.productimportexport) ===
    //   null
    // ) {
    //   return <Redirect to="/home" />;
    // }

    // if(JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER)
    // {
    //   if(localStorage.userStatus !== "Account Approved")
    //   {
    //     return (<div id="no_prod_listing_page" className="no-products-found">  
    //     <h4>Oops! Your Account is not Approved to access this page.</h4>     
    //   </div>)
    //   }
    // }

    const { resources } = this.state;
    let formElementsArray = [];
    for (let key in this.state.uploadForm) {
      formElementsArray.push({
        id: key,
        config: this.state.uploadForm[key]
      });
    }

    let formElementsDropdownArray = [];
    for (let key in this.state.uploadFormDropdowns) {
      formElementsDropdownArray.push({
        id: key,
        config: this.state.uploadFormDropdowns[key]
      });
    }
    if (this.props.userType === RoleCodes.SUPPLIER) {
      if (this.state.languageList.length === 1) {
        formElementsDropdownArray = formElementsDropdownArray.filter(x => x.id !== "language" && x.id !== "supplier");
      }
    }
    if (this.props.userType === RoleCodes.SUPPLIERSUPPORTPERSON) {
      if (this.state.languageList.length === 1) {
        formElementsDropdownArray = formElementsDropdownArray.filter(x => x.id !== "language");
      }
    }
    
    switch (this.props.userType) {
      case RoleCodes.SUPPLIER:
        if (!this.state.loading) {
          pageBody = (
            <form className="upload-form" onSubmit={this.submitHandler}>
              <GridContainer>
                <GridItem md="6">
                  {/* <Input
                    elementType={"select"}
                    elementConfig={{
                      type: "select",
                      options: [],
                      label: "Select Supplier",
                      value: ""
                    }}
                  /> */}
                  {formElementsDropdownArray.map(formElement => (
                    <Input
                      elementType={formElement.config.elementType}
                      elementConfig={formElement.config.elementConfig}
                      invalid={!formElement.config.valid}
                      shouldValidate={formElement.config.validation}
                      touched={formElement.config.touched}
                      errorMessage={formElement.config.errorMessage}
                      value={formElement.config.value}
                      SelectChange={event =>
                        this.onLanguageChangeHandler(
                          event,
                          formElement.id
                        )
                      }
                    />
                  ))}
                </GridItem>
              </GridContainer>
              <GridContainer>
                <GridItem xs={12} md={6} sm={6} lg={6}>
                  <div className="imp_form_left">
                    <div className="imp_form_left_upload">
                      {formElementsArray.map(formElement => (
                        <div key={formElement.id} className="upload_input">
                          <p className="upload_label">Upload your file here</p>
                          <Input
                            elementType={formElement.config.elementType}
                            elementConfig={formElement.config.elementConfig}
                            invalid={!formElement.config.valid} 
                            shouldValidate={formElement.config.validation}
                            touched={formElement.config.touched}
                            errorMessage={formElement.config.errorMessage}
                            value={formElement.config.value}
                            changed={event =>
                              this.fileSelectedHandler(event, formElement.id)
                            }
                            SelectChange={event =>
                              this.onLanguageChangeHandler(
                                event,
                                formElement.id
                              )
                            }
                          />
                          <p id="fie-upload-message">
                            <span>Maximum upoad size upto 500MB</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </GridItem>
                <GridItem className="imp_downl" xs={12} md={6} sm={6} lg={6}>
                  <p>
                    Import product in a specific format. Please find the
                    required template for download below.{" "}
                  </p>
                  <a href="#" onClick={this.downloadProductTemplate}>
                  Product Template
                  </a>
                  <Button
                    className="import_subm_btn"

                    orangeSubmit
                    onClick={event => this.submitHandler(event)}
                  >
                    {getLabelText(
                      resources.filter(x => {
                        return x.resourceKey === "uploadbutton";
                      })[0],
                      "Import"
                    )}
                  </Button>
                </GridItem>
              </GridContainer>
            </form>
          );
        }
        return (
          <div className="">
            <GridContainer className="import_export" >
              <GridItem xs={12} sm={12} md={6}>
                <div className="import_div">
                  <span>
                    {getLabelText(
                      resources.filter(x => {
                        return x.resourceKey === "importproducts";
                      })[0],
                      "Import Products"
                    )}
                  </span>
                  {pageBody}
                </div>
              </GridItem>
            </GridContainer>
          </div>
        );
     // case RoleCodes.SUPPLIERSUPPORTPERSON:
      case RoleCodes.SUPPLIERRELATIONSHIPMANAGER:
        if (!this.state.loading) {
          pageBody = (
            <form className="upload-form" onSubmit={this.submitHandler}>
              <GridContainer>
                <GridItem md="6">
                  {formElementsDropdownArray.map(formElement => (
                    <Input
                      elementType={formElement.config.elementType}
                      elementConfig={formElement.config.elementConfig}
                      invalid={!formElement.config.valid}
                      shouldValidate={formElement.config.validation}
                      touched={formElement.config.touched}
                      errorMessage={formElement.config.errorMessage}
                      value={formElement.config.value}
                      SelectChange={formElement.id === 'supplier' ? (event) => this.onSupplierChangeHandler(event, formElement.id)
                        : (event) => this.onLanguageChangeHandler(event, formElement.id)}
                    />
                  ))}
                </GridItem>
              </GridContainer>
              <GridContainer justify="center">
                <GridItem xs={12} md={6} sm={6} lg={6}>
                  <div className="imp_form_left">
                    <div className="imp_form_left_upload">

                      {formElementsArray.map((formElement) => (
                        <div key={formElement.id} className={formElement.id === "supplier" ? "imp_downl" : "upload_input"}>
                          {formElement.id === 'supplier' ? "" :
                            <p className="upload_label">Upload your file here</p>}
                          <Input
                            elementType={formElement.config.elementType}
                            elementConfig={formElement.config.elementConfig}
                            invalid={!formElement.config.valid}
                            shouldValidate={formElement.config.validation}
                            touched={formElement.config.touched}
                            errorMessage={formElement.config.errorMessage}
                            //value={formElement.config.value}
                            changed={event =>
                              this.fileSelectedHandler(event, formElement.id)
                            }
                          />
                          {formElement.id === 'supplier' ? "" :
                            <p id="fie-upload-message">
                              <span>Maximum upoad size upto 500MB</span>
                            </p>}
                        </div>
                      ))}
                    </div>

                  </div>

                </GridItem>
                <GridItem className="imp_downl" xs={12} md={6} sm={6} lg={6}>
                  <p>Partner Import in a specific format.
                    Please find the required template
                    for download below. </p>
                  <a href="#" onClick={this.downloadProductTemplate}>
                  PARTNER TEMPLATE
                  </a>
                  <Button className="import_subm_btn"
                    orangeSubmit
                    onClick={event => this.submitHandler(event)}
                  >
                    {getLabelText(
                      resources.filter(x => {
                        return x.resourceKey === "uploadbutton";
                      })[0],
                      "IMPORT"
                    )}
                  </Button>
                </GridItem>
              </GridContainer>
            </form>
          );
        }
        return (
          <div className="">
            <GridContainer className="import_export" >
              <GridItem xs={12} sm={12} md={6}>
                <div className="import_div">
                  <span>
                    {getLabelText(
                      resources.filter(x => {
                        return x.resourceKey === "partnerimport";
                      })[0],
                      "Partner Import"
                    )}
                  </span>
                  {pageBody}
                </div>
              </GridItem>
            </GridContainer>
          </div>
        );
      default:
        return <Redirect to="/home" />;
    }
  }
}

const mapStateToProps = state => {
  return {
    userId: state.login.userId,
    userType: state.login.userType,
    tokenId: state.login.tokenId,
    languageId: state.login.languageId,
    permissions: state.login.permissions
  };
};
export default connect(mapStateToProps)(ImportPartner);
