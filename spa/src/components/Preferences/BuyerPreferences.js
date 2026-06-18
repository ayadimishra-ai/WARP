import React, { Component } from "react";
import Button from "../../UI/Button/MaterialButton";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import Close from "@material-ui/icons/Close";
import StepLabel from "@material-ui/core/StepLabel";
import StepConnector from "@material-ui/core/StepConnector";
import StepButton from "@material-ui/core/StepButton";
import { withStyles } from "@material-ui/core/styles";
import { BreadCrumb } from "../../utility";
import ProductCategories from "./ProductCategories";
import CertificatesSelection from "./CertificatesSelection";
import axios from "axios";
import { getServiceUrl } from "../../config";
import Spinner from "../../UI/Spinner/Spinner";

const styles = (theme) => ({
  step: {
    "& $completed": {
      zIndex: "99",
      color: "#fff",
      fontSize: "16px",
    },
    "& $active": {
      zIndex: "99",
      color: "#FFA93C",
      fontSize: "16px",
    },
    "& $disabled": {
      zIndex: "99",
      color: "#1C9689",
      fontSize: "16px",
    },
  },
  activeLabel: {
    zIndex: "99",
    color: "#fff !important",
    fontSize: "16px",
  },
  completedLabel: {
    zIndex: "99",
    color: "#fff !important",
    fontSize: "16px",
  },
  connectorActive: {
    top: "8px",
    left: "calc(-50% + -8px)",
    right: "calc(50% + 24px)",
    "& $connectorLine": {
      borderColor: "transparent",
      height: "2px",
      background:
        "repeating-linear-gradient(to right,#ffffff 0,#ffffff 5px,transparent 5px,transparent 7px)",
    },
  },
  connectorCompleted: {
    top: "8px",
    left: "calc(-47% + -10px)",
    right: "calc(50% + 24px)",
    "& $connectorLine": {
      borderColor: "transparent",
      height: "2px",
      background:
        "repeating-linear-gradient(to right,#ffffff 0,#ffffff 5px,transparent 5px,transparent 7px)",
    },
  },
  connectorDisabled: {
    top: "8px",
    zIndex: "9",
    left: "calc(-50% + -8px)",
    right: "calc(50% + 24px)",
    "& $connectorLine": {
      borderColor: "transparent",
      height: "2px",
      background:
        "repeating-linear-gradient(to right,#1C9689 0,#1C9689 5px,transparent 5px,transparent 7px)",
    },
  },
  connectorLine: {
    transition: theme.transitions.create("border-color"),
  },
  alternativeLabel: {
    fontFamily: "'Sora', sans-serif !important",
    fontSize: "12px",
    fontWeight: "600",
    lineHeight: "15px",
    color: "#1C9689",
    whiteSpace: "nowrap",
    top: "8px",
    left: "calc(-50% + -15px)",
    right: "calc(50% + 20px)",
    "& $connectorLine": {
      borderColor: theme.palette.grey[500],
    },
  },
  active: {}, //needed so that the &$active tag works
  completed: {},
  disabled: {},
  labelContainer: {
    width: "135px",
    "&$alternativeLabel": {
      marginTop: 0,
    },
  },
});

let selectedProductCertificateData = [];
let selectedSupplierCertificateData = [];
let onfirstload = false;
class BuyerPreferences extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeStep: 0,
      productCerficatesDetailslist: [],
      cerficatesDetailslist: [],
      ProductTypedetails: [],
      selectedCategories: [],
      ExistingSelectedProductTypeValue: [],
      loading: false,
      show: false,
      message: "",
      CertificatesState: "",
      completed: {},
      ifEdit: false,
    };
  }

  componentDidMount() {
    //  this.GetProductTypedetails();
    this.getProductCertificatesList();
    this.getSupplierCertificatesList();
  }

  // handleChange = (isSelected, supplierDocumentGuid, Type) => {
  //   switch (Type) {
  //     case "SupplierDocuments":
  //       this.setState({ ifEdit: true });
  //       if (isSelected == 0) {
  //         selectedSupplierCertificateData.push(supplierDocumentGuid);
  //       } else {
  //         let array = selectedSupplierCertificateData;
  //         var index = array.indexOf(supplierDocumentGuid);
  //         if (index !== -1) {
  //           array.splice(index, 1);
  //           selectedSupplierCertificateData = array;
  //         }
  //       }
  //       var certificateList = this.state.cerficatesDetailslist;
  //       certificateList
  //         .filter((x) => x.supplierDocumentGuid === supplierDocumentGuid)
  //         .map((item, index) => {
  //           item.isSelected = isSelected == "0" ? "1" : "0";
  //         });
  //       this.setState({ cerficatesDetailslist: certificateList });
  //       break;

  //     case "ProductCertificates":
  //       this.setState({ ifEdit: true });
  //       if (isSelected == 0) {
  //         selectedProductCertificateData.push(supplierDocumentGuid);
  //       } else {
  //         let array = selectedProductCertificateData;
  //         var index = array.indexOf(supplierDocumentGuid);
  //         if (index !== -1) {
  //           array.splice(index, 1);
  //           selectedProductCertificateData = array;
  //         }
  //       }

  //       var certificateList = this.state.productCerficatesDetailslist;
  //       certificateList
  //         .filter((x) => x.productCertificateGuid === supplierDocumentGuid)
  //         .map((item, index) => {
  //           item.isSelected = isSelected == "0" ? "1" : "0";
  //         });
  //       this.setState({ productCerficatesDetailslist: certificateList });
  //       break;

  //     default:
  //       break;
  //   }
  // };

  // saveData = () => {
  //   this.setState({ loading: true, ifEdit: false });
  //   this.handleComplete();
  //   window.scrollTo(0, 0);
  //   if (this.state.activeStep === 0) {
  //     this.SaveProductCategory();
  //   } else if (this.state.activeStep === 1) {
  //     this.SaveSupplierCertificates();
  //   } else if (this.state.activeStep === 2) {
  //     this.SaveProductCertificates();
  //   }
  // };

  // SaveSupplierCertificates() {
  //   var lstSupplierDocumentGuid = selectedSupplierCertificateData;

  //   var config = {
  //     headers: {
  //       Authorization: "Bearer " + localStorage.tokenId,
  //       CompanyGuid: localStorage.companyGuid,
  //       UserGuid: localStorage.userId,
  //     },
  //   };

  //   axios
  //     .post(
  //       getServiceUrl() + "Users/SaveSupplierCertificates",
  //       lstSupplierDocumentGuid,
  //       config
  //     )
  //     .then((response) => {
  //       if (response.data != null) {
  //         this.setState({
  //           show: true,
  //           message: response.data,
  //           CertificatesState: "for Supplier Certificates",
  //           loading: false,
  //         });
  //       }
  //     });
  // }
  // SaveProductCertificates() {
  //   var lstProductCertificateGuid = selectedProductCertificateData;

  //   var config = {
  //     headers: {
  //       Authorization: "Bearer " + localStorage.tokenId,
  //       CompanyGuid: localStorage.companyGuid,
  //       UserGuid: localStorage.userId,
  //     },
  //   };

  //   axios
  //     .post(
  //       getServiceUrl() + "Users/SaveProductCertificates",
  //       lstProductCertificateGuid,
  //       config
  //     )
  //     .then((response) => {
  //       if (response.data != null) {
  //         this.setState({
  //           show: true,
  //           message: response.data,
  //           CertificatesState: "for Product Certificates",
  //           loading: false,
  //         });
  //       }
  //     });
  // }

  // SaveProductCategory() {
  //   var lstProductCategoryGuid = this.state.selectedCategories.map((item) => {
  //     return item.categoryGuid;
  //   });
  //   var config = {
  //     headers: {
  //       Authorization: "Bearer " + localStorage.tokenId,
  //       CompanyGuid: localStorage.companyGuid,
  //       RoleGuid: localStorage.roleGuid,
  //       UserGuid: localStorage.userId,
  //     },
  //   };

  //   axios
  //     .post(
  //       getServiceUrl() + "Users/SaveProductCategory",
  //       lstProductCategoryGuid,
  //       config
  //     )
  //     .then((response) => {
  //       if (response.data != null) {
  //         this.setState({
  //           show: true,
  //           message: response.data,
  //           CertificatesState: "for Product Categories",
  //           loading: false,
  //         });
  //       }
  //     });
  // }

  getProductCertificatesList() {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        CompanyGuid: localStorage.companyGuid,
        Action: "Product Certificates",
      },
    };
    axios
      .get(getServiceUrl() + "Users/GetCertificateDetails", config)
      .then((response) => {
        if (response.status == 200) {
          if (response.data.table1.length > 0) {
            response.data.table1.map((item) => {
              if (item.isSelected === "1") {
                selectedProductCertificateData.push(
                  item.productCertificateGuid
                );
              }
            });
          }
          this.setState({ productCerficatesDetailslist: response.data.table1 });
        }
      });
  }

  getSupplierCertificatesList() {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        CompanyGuid: localStorage.companyGuid,
        Action: "Supplier Certificates",
      },
    };
    axios
      .get(getServiceUrl() + "Users/GetCertificateDetails", config)
      .then((response) => {
        if (response.status == 200) {
          if (response.data.table1.length > 0) {
            response.data.table1.map((item) => {
              if (item.isSelected === "1") {
                selectedSupplierCertificateData.push(item.supplierDocumentGuid);
              }
            });
          }
          this.setState({ cerficatesDetailslist: response.data.table1 });
        }
      });
  }

  OnSelectChange = (data) => {
    this.setState({
      selectedCategories: data,
      // ifEdit: true
    });
  };

  getSteps() {
    return [
      "Product Categories",
      "Supplier Certificates",
      "Product Certificates",
    ];
    // return ['Cost Details', 'Terms of Sale', 'Preview', 'Submit RFQ'];
  }
  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <ProductCategories
            // onselect={(selectedData) => {
            //   this.OnSelectChange(selectedData);
            // }}
            // ifEdit={this.edit.bind(this)}
            handleBack={() => this.handleBack()}
            handleNext={() => this.handleNext()}
            handleComplete={(ifEdit, show, message, CertificatesState) => {
              this.handleComplete(ifEdit, show, message, CertificatesState);
            }}
          />
        );


      case 1:
        return (
          <CertificatesSelection
            title="Supplier Certificate"
            subTitle="Select certificates that you would like your suppliers should have."
            certificateDetails={this.state.cerficatesDetailslist}
            // callBack={this.handleChange.bind(this)}
            handleBack={() => this.handleBack()}
            handleNext={() => this.handleNext()}
            activeStep={this.state.activeStep}
            handleComplete={(ifEdit, show, message, CertificatesState) => {
              this.handleComplete(ifEdit, show, message, CertificatesState);
            }}
            selectedProductCertificateData={selectedProductCertificateData}
            selectedSupplierCertificateData={selectedSupplierCertificateData}
            show={this.state.show}
          />
        );
      case 2:
        return (
          <CertificatesSelection
            certificateDetails={this.state.productCerficatesDetailslist}
            title="Product Certificate"
            subTitle="Select certificates that you would like your preferred products should have."
            // callBack={this.handleChange.bind(this)}
            handleBack={() => this.handleBack()}
            handleNext={() => this.handleNext()}
            activeStep={this.state.activeStep}
            // handleComplete={(data) => {
            //   this.handleComplete(data);
            // }}
            handleComplete={(ifEdit, show, message, CertificatesState) => {
              this.handleComplete(ifEdit, show, message, CertificatesState);
            }}
            selectedProductCertificateData={selectedProductCertificateData}
            selectedSupplierCertificateData={selectedSupplierCertificateData}
            show={this.state.show}
          />
        );
    }
  }

  edit = (abc) => {
    this.setState({ ifEdit: abc });
  };
  handleNext = () => {
    this.setState((state) => ({
      activeStep: state.activeStep + 1,
    }));
  };

  handleStep = (index) => {
    this.setState((state) => ({
      activeStep: index,
    }));
  };

  handleBack = () => {
    this.setState((state) => ({
      activeStep: state.activeStep - 1,
    }));
  };

  handleReset = () => {
    this.setState({
      activeStep: 0,
    });
  };
  Close = () => {
    this.setState({ show: false, message: "", CertificatesState: "" });
  };
  handleComplete = (data, show, message, CertificatesState) => {
    if (data) {
      const { completed } = this.state;
      completed[this.state.activeStep] = true;
      this.setState({
        completed,
      });
    }
    if (show) {
      this.setState({
        show: show,
        message: message,
        CertificatesState: CertificatesState,
      });
    }
  };
  render() {
    const { classes } = this.props;
    const connector = (
      <StepConnector
        classes={{
          active: classes.connectorActive,
          completed: classes.connectorCompleted,
          // disabled: classes.connectorDisabled,
          alternativeLabel: classes.connectorCompleted,
          line: classes.connectorLine,
        }}
      />
    );
    const steps = this.getSteps();
    const { activeStep } = this.state;
    if (this.state.loading) {
      return <Spinner />;
    } else
      return (
        <React.Fragment>
          <div className="breadtitle_wrap steppercontainer">
            {BreadCrumb([
              { pageName: "Shop", url: "/shop" },
              { pageName: "Preferences", url: "/preferences" },
            ])}
            <div className="page_top_title">
              <div className="page_heading">Organisation Preferences</div>
              <div className="rfq_stepper_div common_stepper_cont">
                <Stepper
                  nonLinear
                  className="rfq_stepper common_stepper"
                  connector={connector}
                  activeStep={activeStep === 3 ? activeStep + 1 : activeStep}
                  alternativeLabel
                >
                  {steps.map((label, index) => (
                    <Step
                      last={true}
                      key={label}
                      classes={{
                        root: classes.step,
                        completed: classes.completed,
                        active: classes.active,
                        disabled: classes.disabled,
                      }}
                    >
                      <StepButton
                        onClick={() => {
                          this.handleStep(index);
                        }}
                        completed={this.state.completed[index]}
                      >
                        <StepLabel
                          className="stepper_label"
                          classes={{
                            alternativeLabel: classes.alternativeLabel,
                            labelContainer: classes.labelContainer,
                            active: classes.activeLabel,
                            completed: classes.completedLabel,
                          }}
                          StepIconProps={{
                            classes: {
                              root: classes.step,
                              completed: classes.completed,
                              active: classes.active,
                              disabled: classes.disabled,
                            },
                          }}
                        >
                          {label}
                        </StepLabel>
                      </StepButton>
                    </Step>
                  ))}
                </Stepper>
              </div>
            </div>
          </div>
          <div className=" preference_container">
            {this.getStepContent(activeStep)}
            {/* {this.state.loading == false ? (
              <div className="action_btn">
                {activeStep === 0 ? (
                  ""
                ) : (
                  <Button
                    onClick={this.handleBack}
                    className="new_prev_btn_arrow"
                  >
                    Prev
                  </Button>
                )}
                {activeStep == 2 ? (
                  ""
                ) : (
                  <Button onClick={this.handleNext} className="solid_btn_new">
                    Next
                  </Button>
                )}

                <Button onClick={this.saveData} className="solid_btn_new">
                  Save Preferences
                </Button>
              </div>
            ) : (
              ""
            )} */}

            {this.state.show ? (
              <div className="pref_popup">
                <div className="backdrop" onClick={this.Close} />
                <div
                  style={{ overflow: "hidden" }}
                  className="pref_popup_container"
                >
                  <div className="heading">
                    <span>Success</span>
                    <Close onClick={this.Close} />
                  </div>
                  <div className="content">
                    <img
                      style={{
                        position: "absolute",
                        left: "-9%",
                        width: "40%",
                        opacity: " 0.2",
                        top: "22%",
                      }}
                      src={require("../../assets/img/success_check.svg")}
                    />
                    <img src={require("../../assets/img/success_check.svg")} />
                    <p className="title">{this.state.message}</p>
                    <p className="subTitle">{this.state.CertificatesState}</p>
                  </div>
                  <div className="action">
                    <Button className="outline_btn_new" onClick={this.Close}>
                      Cancel
                    </Button>
                    <Button className="successBtn" onClick={this.Close}>
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        </React.Fragment>
      );
  }
}
export default withStyles(styles)(BuyerPreferences);