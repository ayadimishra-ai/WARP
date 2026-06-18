import React, { Component } from "react";
import { getPageResource } from "../../utility";
import Button from "../../UI/Button/MaterialButton";
import Input from "../../UI/Input/MaterialInput";
import {
  getWebsiteLanguageGuid,
  getLabelText,
  getLanguageResourceElasticIndex,
  getServiceUrl
} from "../../config";
import axios from "axios";
import toaster from "toasted-notes";
import { toasterAlert } from "../../utility";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem.jsx";
import { confirmAlert } from "react-confirm-alert";
import * as RoleCodes from '../../rolecodes';
import Spinner from '../../UI/Spinner/Spinner';

const initialState = {
  approveRejectForm: {
    rejectionReason: {
      elementType: "textarea",
      className: "dddd",
      elementConfig: {
        type: "text",
        placeholder: "please mention reason for rejection here..."
      },
      value: "",
      validation: {
        required: true
      },
      errorMessage: "Reason For Rejection is required",
      valid: false,
      touched: false,
      formControlProps: { fullWidth: true }
    }
  },
  formIsValid: false,
  resources: [],
  showing: false,
  showApprovedBtn: false,
  showRejectBtn: false,
  Confidencevalue: "",
  ListConfidencevalue: [],
  ConfidencevalueDisplayText: "",
  PreviousproductStatusText: "",
  PreviousConfidencevalueDisplayText: "",
  loading: false
};

class ProductApproveReject extends Component {
  constructor(props) {
    super(props);
    this.inputChangedHandler = this.inputChangedHandler.bind(this);
    this.state = {
      ...initialState
    };
  }
  onApproveClick = buttonText => {
    let Confidencevalue = this.state.Confidencevalue;
    if (Confidencevalue !== "" && Confidencevalue !== "0") {
      confirmAlert({
        message:
            'Are you sure you want to Approve ?',
        buttons: [
            {
                label: 'Yes',
                onClick: () => this.updateProductStatus(buttonText, "")
            },
            {
                label: 'No',                
            }]
      })
    } else {
      confirmAlert({
        message: "Please select Confidence Level",
        buttons: [
          {
            label: 'OK',
          }
        ]
      });
    }

  };

  onRejectClick = () => {
    let Confidencevalue = this.state.Confidencevalue;
    if (Confidencevalue !== "" && Confidencevalue !== "0") {
      this.setState({ showing: true });
    } else {
      confirmAlert({
        message: "Please select Confidence Level",
        buttons: [
          {
            label: 'OK',
          }
        ]
      });
    }

  };
  onCancleClick = () => {
    this.setState({ showing: false });
  };

  checkValidity(value, rules) {
    let isValid = true;
    if (rules.required) {
      isValid = value.trim() !== "" && isValid;
    }
    return isValid;
  }

  inputChangedHandler = (event, inputIdentifier) => {
    const updatedapproveRejectForm = {
      ...this.state.approveRejectForm
    };
    const updatedFormElement = {
      ...updatedapproveRejectForm[inputIdentifier]
    };
    updatedFormElement.value = event.target.value;
    updatedFormElement.valid = this.checkValidity(
      updatedFormElement.value,
      updatedFormElement.validation
    );
    updatedFormElement.touched = true;
    updatedapproveRejectForm[inputIdentifier] = updatedFormElement;

    let formIsValid = true;
    for (let inputIndentifiers in updatedapproveRejectForm) {
      formIsValid =
        updatedapproveRejectForm[inputIndentifiers].valid && formIsValid;
    }
    this.setState({
      approveRejectForm: updatedapproveRejectForm,
      formIsValid: formIsValid
    });
  };

  submitHandler = event => {
    event.preventDefault();

    let Confidencevalue = this.state.Confidencevalue;
    if (Confidencevalue !== "" && Confidencevalue !== "0") {

      const formData = {};
      for (let formElementIdentifier in this.state.approveRejectForm) {
        formData[formElementIdentifier] = this.state.approveRejectForm[
          formElementIdentifier
        ].value;
      }
      if (this.state.formIsValid) {
        this.updateProductStatus(
          "REJECT",
          this.state.approveRejectForm.rejectionReason.value
        );
      } else {
        const updatedapproveRejectForm = { ...this.state.approveRejectForm };
        for (let inputIndentifiers in updatedapproveRejectForm) {
          updatedapproveRejectForm[
            inputIndentifiers
          ].touched = !updatedapproveRejectForm[inputIndentifiers].valid;
        }
        this.setState({
          approveRejectForm: updatedapproveRejectForm
        });
      }
    } else {
      confirmAlert({
        message: "Please select Confidence Level",
        buttons: [
          {
            label: 'OK',
          }
        ]
      });
    }

  };

  updateProductStatus = (btnText, comment) => {
    this.setState({ loading: true });
    const product = {
      ProductGuid: this.props.ProductGuid,
      ProductStatus: btnText,
      Comment: comment,
      LanguageGuid: this.props.languageId,
      UserGuid: this.props.userId,
      CompanyGuid: this.props.CompanyGuid,
      ProductConfidenceLevelGuid: this.state.Confidencevalue
    };
    axios({
      url: getServiceUrl() + "Product/UpdateProductStatus?",
      method: "post",
      data: product,
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json"
      }
    }).then(response => {

      toaster.notify(toasterAlert("SUCCESS", response.data.saveresult));
      //alert(response.data.saveresult);  
      this.setState({ showing: false, showRejectBtn: false, showApprovedBtn: false,loading:false  });
      this.getConfidenceListDetails();
    });
  };

  componentDidMount() {
    getPageResource(
      getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "loginpage")
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
    if (this.props.ProductStatus === "Pending") {
    //   this.setState({ showRejectBtn: true, showApprovedBtn: false });
    // } else if (this.props.ProductStatus === "Rejected") {
    //   this.setState({ showApprovedBtn: true, showRejectBtn: false });
    // } else {
      this.setState({ showApprovedBtn: true, showRejectBtn: true });
    }
    this.getConfidenceListDetails();
  }

  SelectConfidencevalue = (event) => {
    let value = event.target.value;
    let DisplayText = event.currentTarget.innerText;
    this.setState({ Confidencevalue: value, ConfidencevalueDisplayText: DisplayText });
  }

  getConfidenceListDetails = () => {
    axios({
      url: getServiceUrl() + "Product/GetProductConfidenceLevel",
      method: "get",
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        "productGuid": this.props.ProductGuid
      }
    }).then(response => {
      var lstConfidencevalue = [];
      if (response.data.productStatus !== null) {
        if (response.data.productStatus !== "") {
          this.setState({ PreviousproductStatusText: response.data.productStatus });
          if (this.props.ProductStatus === undefined) {
            if (response.data.productStatus === "Pending") {
            //   this.setState({ showRejectBtn: true, showApprovedBtn: false });
            // } else if (response.data.productStatus === "Rejected") {
            //   this.setState({ showApprovedBtn: true, showRejectBtn: false });
            // } else {
              this.setState({ showApprovedBtn: true, showRejectBtn: true });
            }
          }
        }
      }
      if (response.data.result !== null) {
        response.data.result.map((item) => {
          if (response.data.productConfidenceLevelGuid !== null) {
            if (response.data.productConfidenceLevelGuid !== "") {
              if (response.data.productConfidenceLevelGuid === item.productConfidenceLevelGuid) {
                this.setState({ PreviousConfidencevalueDisplayText: item.confidenceLevel })
              }
            }
          }
          lstConfidencevalue.push({ Id: item.productConfidenceLevelGuid, Value: item.confidenceLevel, name: item.confidenceLevel });
        });

        this.setState({ ListConfidencevalue: lstConfidencevalue });
      }
    });
  }

  render() {
    const formElementsArray = [];
    const { resources } = this.state;
    const { showing } = this.state;

    for (let key in this.state.approveRejectForm) {
      formElementsArray.push({
        id: key,
        config: this.state.approveRejectForm[key]
      });
    }

    let displaydata = "";
    if (this.props.userType.includes(RoleCodes.APPROVER) || this.props.userType.includes(RoleCodes.SUPPLIERRELATIONSHIPMANAGER)) {
      if(this.props.ProductStatus === "Pending")
      {
        displaydata = <GridContainer className="confidenceLevel">
          <GridItem md={6}>
            <div>
              <Input
                elementType={"select"}
                elementConfig={{
                  type: "select",
                  options: this.state.ListConfidencevalue,
                  label: "Select Confidence Level",
                  value: ""
                }}
                SelectChange={this.SelectConfidencevalue}
                changed={this.SelectConfidencevalue}
                value={this.state.Confidencevalue}
              />
              {/* <h6>Confidence Level - {this.state.ConfidencevalueDisplayText !== "" ? this.state.ConfidencevalueDisplayText : "Not Selected"}</h6> */}
              <h6> Confidence Level - {this.state.PreviousConfidencevalueDisplayText !== "" ? this.state.PreviousConfidencevalueDisplayText : "Not Selected"}</h6>
              <h6> Product Status - {this.state.PreviousproductStatusText !== "" ? this.state.PreviousproductStatusText : "Not Selected"}</h6>
            </div>
          </GridItem>
          <GridItem md={6}>
            <div className="aprove_reject_btn">
              {this.state.showRejectBtn ? (
                <Button simple onClick={() => this.onRejectClick()}>
                  REJECT
                </Button>
              ) : (
                ""
              )}
              {this.state.showApprovedBtn ? (
                <Button
                  blackBtnSimple
                  onClick={() => this.onApproveClick("APPROVE")}
                >
                  APPROVE
                </Button>
              ) : (
                ""
              )}
            </div>
            <div
              className="aprove_reject"
              style={{ display: showing ? "block" : "none" }}
            >
              {formElementsArray.map(formElement => (
                <Input
                  key={formElement.id}
                  elementType={formElement.config.elementType}
                  elementConfig={formElement.config.elementConfig}
                  invalid={!formElement.config.valid}
                  shouldValidate={formElement.config.validation}
                  touched={formElement.config.touched}
                  errorMessage={formElement.config.errorMessage}
                  formControlProps={formElement.config.formControlProps}
                  changed={event =>
                    this.inputChangedHandler(event, formElement.id)
                  }
                  onKeyPress={this.enterkey}
                />
              ))}
              <Button
                orangeSubmit
                className="btn-primary"
                onClick={event => this.submitHandler(event)}
              >
                {getLabelText(
                  resources.filter(x => {
                    return x.resourceKey === "commentbutton";
                  })[0],
                  "Submit"
                )}
              </Button>
              <Button
                simple
                className="btn-primary"
                onClick={event => this.onCancleClick(event)}
              >
                Cancel
              </Button>
            </div>
          </GridItem>
        </GridContainer>
      }
      else
      {
        displaydata = <GridContainer className="confidenceLevel">
          <GridItem md={6}>
            <h6>Confidence Level - {this.state.PreviousConfidencevalueDisplayText !== "" ? this.state.PreviousConfidencevalueDisplayText : "Not Selected"}</h6>
            <h6>Product Status - {this.state.PreviousproductStatusText !== "" ? this.state.PreviousproductStatusText : "Not Selected"}</h6>
          </GridItem>
        </GridContainer>
      }
    }

    if (this.props.userType.includes(RoleCodes.ADMIN) || this.props.userType.includes(RoleCodes.SUPPLIERSUPPORTPERSON)) {
      displaydata = <GridContainer className="confidenceLevel">
        <GridItem md={6}>
          <h6>Confidence Level - {this.state.PreviousConfidencevalueDisplayText !== "" ? this.state.PreviousConfidencevalueDisplayText : "Not Selected"}</h6>
          <h6>Product Status - {this.state.PreviousproductStatusText !== "" ? this.state.PreviousproductStatusText : "Not Selected"}</h6>
        </GridItem>
      </GridContainer>
    }

    return (
      <React.Fragment>
        <div style={({ display: this.state.loading ? 'none' : 'block' })}>
          {displaydata}
        </div>
        <div style={({ display: this.state.loading ? 'block' : 'none' })}>
          <Spinner />
        </div>
      </React.Fragment>
    );
  }
}

export default ProductApproveReject;
