import axios from "axios";
import React, { Component } from "react";
import { getServiceUrl, getWebsiteUrl } from "../../config";
import Button from "../../UI/Button/MaterialButton";
import Spinner from "../../UI/Spinner/Spinner";

const awsUrl = getWebsiteUrl();

let selectedProductCertificateData = [];
let selectedSupplierCertificateData = [];
let message = "";
let CertificatesState = "";

class CertificatesSelection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSelected: "",
      loading: false,
      ifEdit: false,
    };
  }

  componentDidMount() {
    selectedProductCertificateData = this.props.selectedProductCertificateData;
    selectedSupplierCertificateData = this.props
      .selectedSupplierCertificateData;
  }

  handleBack = () => {
    const { handleBack = (f) => f } = this.props;
    handleBack();
  };

  handleNext = () => {
    const { handleNext = (f) => f } = this.props;
    handleNext();
  };

  handleComplete = () => {
    const { handleComplete = (f) => f } = this.props;
   // if (this.state.ifEdit) {
      handleComplete(
        this.state.ifEdit,
        this.state.show,
        message,
        CertificatesState
      );
      this.setState({ifEdit: false});
   // }
  };

  saveData = async() => {
    this.setState({ loading: true });
    if (this.props.activeStep === 1) {
     await this.SaveSupplierCertificates();
    
    } else if (this.props.activeStep === 2 ) {
      await this.SaveProductCertificates();
    }
    
   // this.setState({ loading: false });
    window.scrollTo(0, 0);
  };

  SaveSupplierCertificates() {
    var lstSupplierDocumentGuid = selectedSupplierCertificateData;

    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        CompanyGuid: localStorage.companyGuid,
        UserGuid: localStorage.userId,
      },
    };

    axios
      .post(
        getServiceUrl() + "Users/SaveSupplierCertificates",
        lstSupplierDocumentGuid,
        config
      )
      .then((response) => {
        if (response.data != null) {
          message = response.data;
          CertificatesState = "for Supplier Certificates";
          this.setState({
            show: true,
            message: response.data,
            CertificatesState: "for Supplier Certificates",
            loading: false,
          });

          this.handleComplete();
        }
      });
  }
  SaveProductCertificates() {
    var lstProductCertificateGuid = selectedProductCertificateData;

    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        CompanyGuid: localStorage.companyGuid,
        UserGuid: localStorage.userId,
      },
    };

    axios
      .post(
        getServiceUrl() + "Users/SaveProductCertificates",
        lstProductCertificateGuid,
        config
      )
      .then((response) => {
        if (response.data != null) {
          message = response.data;
          CertificatesState = "for Product Certificates";
          this.setState({
            show: true,
            message: response.data,
            CertificatesState: "for Product Certificates",
            loading: false,
          });

          this.handleComplete();
        }
      });
  }

  handleChange = (isSelected, supplierDocumentGuid, Type) => {
    switch (Type) {
      case "SupplierDocuments":
        this.setState({ ifEdit: true });
        if (isSelected == 0) {
          selectedSupplierCertificateData.push(supplierDocumentGuid);
        } else {
          let array = selectedSupplierCertificateData;
          var index = array.indexOf(supplierDocumentGuid);
          if (index !== -1) {
            array.splice(index, 1);
            selectedSupplierCertificateData = array;
          }
        }
        // var certificateList = this.state.cerficatesDetailslist;
        var certificateList = this.props.certificateDetails;
        certificateList
          .filter((x) => x.supplierDocumentGuid === supplierDocumentGuid)
          .map((item, index) => {
            item.isSelected = isSelected == "0" ? "1" : "0";
          });
        this.setState({ cerficatesDetailslist: certificateList });
        break;

      case "ProductCertificates":
        this.setState({ ifEdit: true });
        if (isSelected == 0) {
          selectedProductCertificateData.push(supplierDocumentGuid);
        } else {
          let array = selectedProductCertificateData;
          var index = array.indexOf(supplierDocumentGuid);
          if (index !== -1) {
            array.splice(index, 1);
            selectedProductCertificateData = array;
          }
        }

        //  var certificateList = this.state.productCerficatesDetailslist;
        var certificateList = this.props.certificateDetails;
        certificateList
          .filter((x) => x.productCertificateGuid === supplierDocumentGuid)
          .map((item, index) => {
            item.isSelected = isSelected == "0" ? "1" : "0";
          });
        this.setState({ productCerficatesDetailslist: certificateList });
        break;

      default:
        break;
    }
  };

  render() {
    let cerficatelst = [];
    const list = this.props.certificateDetails;
    let sectionlist = list.map(item=>{
      return item.section
      })
      let uniqueSectionlist = [...new Set(sectionlist)];

    if (this.props.title == "Supplier Certificate") {
      cerficatelst = uniqueSectionlist.map((section,i) => {
        let cerficate = list.filter((x)=>{return x.section===section}).map((item,j) => {
        return <div
          className={
            item.isSelected == 1
              ? "certificate_box_items selected_certificate"
              : "certificate_box_items"
          }
          onClick={() =>
            this.handleChange(
              item.isSelected,
              item.supplierDocumentGuid,
              "SupplierDocuments"
            )
          }
        >
          <div className="certificate_icon">
            <img
              src={awsUrl + "SupplierLevelCertificatesIcon/" + item.iconName}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  awsUrl + "SupplierLevelCertificatesIcon/default.jpg";
              }}
            />
          </div>
          <div className="certificate_name">
          <span>{item.supplierDocumentName}</span>
        </div>
      </div>
      });
      return (<div><div style={{margin:'20px 0px 10px'}} className="pref_title">{section}</div>
      <div className="certificate_box">{cerficate}</div></div> )
      });
    }
    if (this.props.title == "Product Certificate") {
      cerficatelst = list.map((item) => (
        <div
          className={
            item.isSelected == 1
              ? "certificate_box_items selected_certificate"
              : "certificate_box_items"
          }
          onClick={() =>
            this.handleChange(
              item.isSelected,
              item.productCertificateGuid,
              "ProductCertificates"
            )
          }
        >
          <div className="certificate_icon">
            <img
              src={awsUrl + "ProductCertificationIcons/" + item.iconName}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = awsUrl + "ProductCertificationIcons/default.jpg";
              }}
            />
          </div>
          <div className="certificate_name">
            <span>{item.productCertificateName}</span>
          </div>
        </div>
      ));
    }
    if (this.state.loading) {
      return <Spinner />;
    } else
      return (
        <div className="pref_certification">
          <div>
            <p className="pref_title">{this.props.title}</p>
            <p className="pref_subTitle">{this.props.subTitle}</p>
          </div>
          {this.props.title == "Supplier Certificate" && cerficatelst.length > 0 ? (
              cerficatelst
            ) : this.props.title == "Product Certificate" && cerficatelst.length > 0 ?
            <div className="certificate_box">{cerficatelst}</div> :
            (
              <div>No Result Found</div>
             
            )}
          <div className="action_btn">
            <Button onClick={this.handleBack} className="new_prev_btn_arrow">
              Prev
            </Button>
            {this.props.activeStep === 2 ? (
              ""
            ) : (
              <Button onClick={this.handleNext} className="solid_btn_new">
                Next
              </Button>
            )}

            <Button onClick={this.saveData} className={this.state.ifEdit ?"solid_btn_new":"solid_btn_new"}>
              Save Preferences
            </Button>
          </div>
        </div>
      );
  }
}
export default CertificatesSelection;
