import React, { Component } from "react";
import axios from "axios";
import { getServiceUrl } from "../../config";
import CustomSearchMultiSelectDropdown_new from "../SupplierOnBoarding/CustomSearchMultiSelectdropdown_new";
import * as RoleCodes from "../../rolecodes";
import Button from "../../UI/Button/MaterialButton";
import Spinner from "../../UI/Spinner/Spinner";

let onfirstload = false;
let iscomponentDidMount = false;
let message = "";
let CertificatesState = "";
class ProductCategories extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ProductTypedetails: [],
      selectedCategories: [],
      ExistingSelectedProductTypeValue: [],
      selectedCat: [],
      message: "",
      CertificatesState: "",
      show: false,
      ifEdit: false,
      loading: false,
    };
  }
  componentDidMount() {
    iscomponentDidMount = true;
    this.GetProductTypedetails();
  }

  GetProductTypedetails() {
    this.setState({ loading: true });
    this.setState({ ProductTypedetails: [], ProductTypes: [] });
    let Rolename = "";
    let checkUserGuid = "00000000-0000-0000-0000-000000000000";
    if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
      Rolename =
        localStorage.userType !== null
          ? String(localStorage.userType).indexOf('"') > -1
            ? JSON.parse(localStorage.userType)
            : localStorage.userType
          : "";
      checkUserGuid = localStorage.userId;
    } else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
      Rolename =
        localStorage.userType !== null
          ? String(localStorage.userType).indexOf('"') > -1
            ? JSON.parse(localStorage.userType)
            : localStorage.userType
          : "";
      checkUserGuid = localStorage.userId;
    }
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        CompanyName: "",
        UserGuid: checkUserGuid,
        CRNNumber: "",
        PanCardNo: "",
        RoleName: Rolename,
      },
    };

    axios
      .get(getServiceUrl() + "Users/GetCategoryProductTypeDetailsNew", config)
      .then((response) => {
        if (response.data.status200OK) {
          onfirstload = true;
          this.setState({
            ProductTypedetails:
              response.data.productTypeDetails.productTypeDetails,
            loading: false,
          });
        }
      });
  }

  OnSelectChange = (data) => {
    // const { onselect = (f) => f } = this.props;
    let selectedCategories = [];
    selectedCategories = data.selectedCategories;
    if (
      this.state.ExistingSelectedProductTypeValue.length == 0 &&
      onfirstload == true
    ) {
      onfirstload = false;
      let ProductOfferingData = selectedCategories.map((item) => {
        let data = {
          categoryGuid: "00000000-0000-0000-0000-000000000000",
          commodityGuid: "00000000-0000-0000-0000-000000000000",
          productTypeGuid: item.categoryGuid,
          subCategoryGuid: "00000000-0000-0000-0000-000000000000",
        };
        return data;
      });
      if (iscomponentDidMount) {
        iscomponentDidMount = false;
        this.setState({
          ExistingSelectedProductTypeValue: ProductOfferingData,
          ProductTypedetails: data.ProductTypedetails,
          selectedCategories: selectedCategories
        });
        
      } else {
        this.setState({
          ExistingSelectedProductTypeValue: ProductOfferingData,
          ProductTypedetails: data.ProductTypedetails,
          selectedCategories: selectedCategories,
          ifEdit: true
        });
      }
    } else {
      if (iscomponentDidMount) {
        iscomponentDidMount = false;
        this.setState({
          ProductTypedetails: data.ProductTypedetails,
          selectedCategories: selectedCategories
        });
        
      } else {
        this.setState({
          ProductTypedetails: data.ProductTypedetails,
          selectedCategories: selectedCategories,
          ifEdit: true
        });
      }
    }

    // onselect(selectedCategories);
    let selectedCata = selectedCategories.map((item, index) => {
      return index === selectedCategories.length - 1
        ? item.categoryName
        : item.categoryName + ", ";
    });
    this.setState({ selectedCat: selectedCata });
  };

  SaveProductCategory = () => {
    var lstProductCategoryGuid = this.state.selectedCategories.map((item) => {
      return item.categoryGuid;
    });

    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        CompanyGuid: localStorage.companyGuid,
        RoleGuid: localStorage.roleGuid,
        UserGuid: localStorage.userId,
      },
    };

    axios
      .post(
        getServiceUrl() + "Users/SaveProductCategory",
        lstProductCategoryGuid,
        config
      )
      .then((response) => {
        if (response.data != null) {
          this.setState({ show: true });
          message = response.data;
          CertificatesState = "for Product Categories";
          this.handleComplete();
        }
      });
  };

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
      this.setState({ ifEdit: false });
   // }
  };

  render() {
    return (
      <React.Fragment>
        {this.state.loading ? (
          <Spinner />
        ) : (
          <div className="pref">
            <div style={{ flex: "0 0 45%" }} className="pref_left">
              <p className="pref_title">Products and Materials</p>
              <p className="pref_subTitle">
                Select products and materials that you would like to buy on
                Snowkap.
              </p>
              {this.state.ProductTypedetails.length > 0 ? (
                <div
                  className="newThemeInput CustomSearchMultiSelectDropdown"
                  //  onClick={() => this.props.ifEdit("true")}
                >
                  <CustomSearchMultiSelectDropdown_new
                    ProductTypedetails={this.state.ProductTypedetails}
                    IsProductShow={false}
                    IsSingleSelection={false}
                    // onRef={ref => (this.child = ref)}
                    onchange={this.OnSelectChange}
                    customDropTitle={this.state.selectedCat.length>0 ? this.state.selectedCat : "Select Product"}
                  />
                  <div className="action_btn">
                    {/* <Button onClick={this.handleBack} className="new_prev_btn_arrow">
                  Prev
                </Button> */}
                    <Button onClick={this.handleNext} className="solid_btn_new">
                      Next
                    </Button>
                    <Button
                      onClick={this.SaveProductCategory}
                      className={
                        this.state.ifEdit ? "solid_btn_new" : "solid_btn_new"
                      }
                    >
                      Save Preferences
                    </Button>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="pref_right">
              <img src={require("../../assets/img/create_rfq_right_img.png")} />
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}
export default ProductCategories;
