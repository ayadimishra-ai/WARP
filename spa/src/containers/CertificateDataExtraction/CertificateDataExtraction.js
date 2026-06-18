import React, { Component } from "react";
import Aux from "../../hoc/Auxx";
import Spinner from "../../UI/Spinner/Spinner";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import {
  getServiceUrl,
  getFileExtension,
  getWebsiteUrl
} from "../../config";
import { connect } from "react-redux";
import { toasterAlert } from '../../utility';
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import axios from "axios";
import toaster from 'toasted-notes';
import { getWebsiteLanguageGuid } from '../../config';
const awsUrl = getWebsiteUrl();

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
    }
  },
  formIsValid: false,
  selectedFile: null,
  loading: false,
  show: false,
};
class CertificateDataExtraction extends Component {
  state = { ...initialState, imgSrc: "", defaulimgSrc: "", newImg: false };

  stateResetHandler() {
    this.setState(this.initialState);

    const updatedUploadFormInfo = {
      ...this.state.uploadForm
    };
    updatedUploadFormInfo.file.touched = false;
    this.setState({
      uploadForm: updatedUploadFormInfo
    });
  }
  componentWillMount() {
    this.initialState = this.state;
  }
  componentDidMount = () => {
    this.stateResetHandler();
    this.setState({ defaulimgSrc: awsUrl + "ProductImages/Thumbnail/default.jpg" });
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
      isValid = value.trim() !== "" && (getFileExtension(value) === "pdf" || getFileExtension(value) === "jpg" || getFileExtension(value) === "jpeg" || getFileExtension(value) === "png");
    }
    return isValid;
  }

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
  submitHandler = event => {
    event.preventDefault();
    const formData = new FormData();
    if (this.state.formIsValid) {
      this.setState({ loading: true });
      formData.append(
        "files",
        this.state.selectedFile,
        this.state.selectedFile.name
      );
      var config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "multipart/form-data",
          "UploadType": "Certificate"
        }
      };
      // axios
      //   .post(
      //     getServiceUrl() +
      //     "FileUpload/uploadfile?LanguageGuid=" +
      //     getWebsiteLanguageGuid() +
      //     "&UserGuid=" +
      //     this.props.userId,
      //     formData,
      //     config
      //   )
      //   .then(response => {
      //     this.setState({ loading: true });
      //     let res = JSON.parse(JSON.stringify(response.data));
      //     if (res !== undefined && res !== '') {
      //       //   toaster.notify(toasterAlert('SUCCESS','Certificate imported successfully'),{
      //       //     duration:null
      //       //   });           
      //       this.setState({ show: true })
      //       document.getElementById("p1").innerHTML = res.CertificateText;
      //       document.getElementById("AccreditedBody").innerHTML = "";
      //       document.getElementById("CertificateName").innerHTML = "";
      //       document.getElementById("CompanyName").innerHTML = "";
      //       document.getElementById("CertificateType").innerHTML = "";
      //       document.getElementById("Products").innerHTML = "";
      //       document.getElementById("ValidFrom").innerHTML = "";
      //       document.getElementById("CertificateExpiry").innerHTML = "";
      //       document.getElementById("RegistrationNumber").innerHTML = "";

      //       if (res.payload !== undefined) {
      //         for (let i = 0; i < res.payload.length; i++) {
      //           if (res.payload[i].displayName === "AccreditedBody")
      //             document.getElementById("AccreditedBody").innerHTML = (document.getElementById("AccreditedBody").innerHTML === '' ? res.payload[i].textExtraction.textSegment.content : document.getElementById("AccreditedBody").innerHTML + ',' + res.payload[i].textExtraction.textSegment.content);
      //           if (res.payload[i].displayName === "CertificateName")
      //             document.getElementById("CertificateName").innerHTML = (document.getElementById("CertificateName").innerHTML === '' ? res.payload[i].textExtraction.textSegment.content : document.getElementById("CertificateName").innerHTML + ',' + res.payload[i].textExtraction.textSegment.content);
      //           if (res.payload[i].displayName === "CompanyName")
      //             document.getElementById("CompanyName").innerHTML = (document.getElementById("CompanyName").innerHTML === '' ? res.payload[i].textExtraction.textSegment.content : document.getElementById("CompanyName").innerHTML + ',' + res.payload[i].textExtraction.textSegment.content);
      //           if (res.payload[i].displayName === "CertificateType")
      //             document.getElementById("CertificateType").innerHTML = (document.getElementById("CertificateType").innerHTML === '' ? res.payload[i].textExtraction.textSegment.content : document.getElementById("CertificateType").innerHTML + ',' + res.payload[i].textExtraction.textSegment.content);
      //           if (res.payload[i].displayName === "Products")
      //             document.getElementById("Products").innerHTML = (document.getElementById("Products").innerHTML === '' ? res.payload[i].textExtraction.textSegment.content : document.getElementById("Products").innerHTML + ',' + res.payload[i].textExtraction.textSegment.content);
      //           if (res.payload[i].displayName === "ValidFrom")
      //             document.getElementById("ValidFrom").innerHTML = (document.getElementById("ValidFrom").innerHTML === '' ? res.payload[i].textExtraction.textSegment.content : document.getElementById("ValidFrom").innerHTML + ',' + res.payload[i].textExtraction.textSegment.content);
      //           if (res.payload[i].displayName === "CertificateExpiry")
      //             document.getElementById("CertificateExpiry").innerHTML = (document.getElementById("CertificateExpiry").innerHTML === '' ? res.payload[i].textExtraction.textSegment.content : document.getElementById("CertificateExpiry").innerHTML + ',' + res.payload[i].textExtraction.textSegment.content);
      //           if (res.payload[i].displayName === "RegistrationNumber")
      //             document.getElementById("RegistrationNumber").innerHTML = (document.getElementById("RegistrationNumber").innerHTML === '' ? res.payload[i].textExtraction.textSegment.content : document.getElementById("RegistrationNumber").innerHTML + ',' + res.payload[i].textExtraction.textSegment.content);
      //         }
      //         this.setState({ imgSrc: awsUrl + "Certificates/" + res.FileName, newImg: true });
      //       }
      //       else {
      //         alert('Some error occured!!');
      //       }
      //       this.setState({ loading: false })
      //     } else {
      //       toaster.notify(toasterAlert('FAIL', 'Certificate data extraction failed!'), {
      //         duration: null
      //       })

      //     }
      //     //this.stateResetHandler();
      //   });
    }
    else {
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
    }
  };
  render() {
    let pageBody = <Spinner />;
    let formElementsArray = [];
    for (let key in this.state.uploadForm) {
      formElementsArray.push({
        id: key,
        config: this.state.uploadForm[key]
      });
    }

    pageBody = (
      <form className="upload-form" onSubmit={this.submitHandler}>
        <GridContainer justify="center">
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
            <div className={this.state.newImg ? 'certficate_uploaded' : 'default_img_certficate'}>
                <img alt=" " style={{display:this.state.newImg? 'inline-block':'none'}} src={this.state.imgSrc} />
                <img alt=" " style={{display:this.state.newImg? 'none':'inline-block'}} src={this.state.defaulimgSrc} />
            </div>
            <Button className="import_subm_btn certficate_upload_btn"
              color="greenBtn"
              round
              orangeSubmit
              onClick={event => this.submitHandler(event)}
            >
              IMPORT
                        </Button>
          </GridItem>
        </GridContainer>
      </form>
    );
    return (
      <Aux>
        <div className="parent_container">
          <div className="import_div">
            <span>
              Import Certificate
                    </span>
            {pageBody}
          </div>
          <div style={({ display: this.state.loading ? 'none' : 'inline-block',margin:'10px' })} className="import_result">
            <div className="import_result_left">
              <div style={{ display: 'block' }}>
                <p>Accredited Body :</p>
                <p id="AccreditedBody"></p>
              </div>

              <div style={{ display: 'block' }}>
                <p>Certificate Expiry :</p>
                <p id="CertificateExpiry"></p>
              </div>

              <div style={{ display: 'block' }}>
                <p>Certificate Name :</p>
                <p id="CertificateName"></p>
              </div>

              <div style={{ display: 'block' }}>
                <p>Certificate Type :</p>
                <p id="CertificateType"></p>
              </div>

              <div style={{ display: 'block' }}>
                <p>Company Name :</p>
                <p id="CompanyName"></p>
              </div>

              <div style={{ display: 'block' }}>
                <p>Products :</p>
                <p id="Products"></p>
              </div>

              <div style={{ display: 'block' }}>
                <p>Registration Number :</p>
                <p id="RegistrationNumber"></p>
              </div>

              <div style={{ display: 'block' }}>
                <p>Valid From :</p>
                <p id="ValidFrom"></p>
              </div>
            </div>
            <div className="import_result_right">
              <div style={{ display: 'block' }}>
                <p>Full Text Extracted :</p>
                <p id="p1"></p>
              </div>
            </div>
          </div>
          <div style={({ display: this.state.loading ? 'block' : 'none' })}>
            <Spinner />
          </div>
        </div>
      </Aux>
    );
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
export default connect(mapStateToProps)(CertificateDataExtraction);