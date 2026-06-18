import axios from "axios";
import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import {
  getAWSUrl, getLabelText,
  getLanguageResourceElasticIndex, getServiceUrl, getWebsiteLanguageGuid
} from "../../config";
import { getPageResource, toasterAlert } from "../../utility";

import PropTypes from "prop-types";
import { connect } from "react-redux";
import toaster from "toasted-notes";
import { v4 as uuidv4 } from "uuid";
import formRightIcon1 from "../../assets/img/Signuponboarding/formRightIcon1.png";
import CongratsSupplier from "../../components/SupplierOnBoarding/CongratsSupplier";
import CreatePassword from "../../components/SupplierOnBoarding/CreatePassword";
import GeneralDetails from "../../components/SupplierOnBoarding/GeneralDetails";
import SupplierSignUp from "../../components/SupplierOnBoarding/SupplierSignUp";
import VerifyEmail from "../../components/SupplierOnBoarding/VerifyEmail";
import * as actionCreators from "../../store/actions/index";
import Spinner from "../../UI/Spinner/Spinner";

let uuid = null;
class SupplierOnBoarding extends Component {
  static contextTypes = {
    router: PropTypes.object,
  };
  constructor(props) {
    super(props);
    this.state = {
      contentState: [],
      showSignUpPage: true,
      showBusinessType: false,
      showGeneralDetails: false,
      showOTP: false,
      showSetPassword: false,
      businessTypeName: "",
      BusinessTypeGuid: null,
      resources: [],
      GeneralDetails: null,
      PreviousGeneralDetails: null,
      MobileNumber: "",
      confirmationResult: "",
      IsOTPVarified: false,
      PasswordDetails: null,
      showVerifyEmail: false,
      UserEmailID: "",
      UserGuid: null,
      showCongratsSupplier: false,
      YourName: "",
      loading: false,
      isCreated: false,
      isBuyer: false,
      roleName: "",
      selectedCountryCode: "",
      ProductTypes: []
    };
  }

  componentDidMount() {
    this.loadData();
    this.getLanguageResource();
  }

  getLanguageResource() {
    getPageResource(
      getLanguageResourceElasticIndex(
        getWebsiteLanguageGuid(),
        "supplierOnBoarding"
      )
    )
      .then((json) => {
        this.setState({ resources: json });
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/logout")
            : ""
          : ""
      );
  }

  loadData = () => {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
      },
    };
    // axios
    //   .get(getServiceUrl() + "Users/GetBusinessTypes", config)
    //   .then((response) => {
    //     this.setState({
    //       contentState: response.data,
    //       BusinessTypeGuid: response.data.filter(x => x.businessTypeName == 'Supplier')[0].businessTypeGuid,
    //       businessTypeName: response.data.filter(x => x.businessTypeName == 'Supplier')[0].businessTypeName
    //     });
    //   })
    //   .catch((err) =>
    //     err.response !== undefined
    //       ? err.response.status === 401
    //         ? console.log(err)
    //         : ""
    //       : ""
    //   );
  };

  OpenStagePage = (event, BusinessTypeName, BusinessTypeGuid) => {
    if (BusinessTypeName !== undefined && BusinessTypeName !== "") {
      this.setState({
        showGeneralDetails: true,
        showBusinessType: false,
        businessTypeName: BusinessTypeName,
        BusinessTypeGuid: BusinessTypeGuid,
      });
    }
  };

  SupplierSignUpNextPage = (Data) => {
    this.loadData();
    let formData = {};
    if (Data.isCreated === "true") {
      formData = {
        emailId: Data.registerDetails[0].emailId,
        YourName: Data.registerDetails[0].firstName,
        companyName: Data.registerDetails[0].companyName,
        ERPId: Data.registerDetails[0].erpSupplierId,
        userCountryId: Data.registerDetails[0].countryGuid,
        Mobile: Data.registerDetails[0].mobileNumber,
        CompanyRegistrationnumber:
          Data.registerDetails[0].companyRegistrationNumber,
        IsOTPSent: false,
        isCreated: true,
        isBuyer: Data.registerDetails[0].isBuyer,
        UserGuid: Data.registerDetails[0].userGuid,
        Pancard: Data.registerDetails[0].panCard,
        RoleName: Data.registerDetails[0].roleName
      };

      this.setState({
        showSignUpPage: false,
        showBusinessType: false,
        showGeneralDetails: true,
        businessTypeName: Data.registerDetails[0].businessTypeName,
        BusinessTypeGuid: Data.registerDetails[0].businessTypeGuid,
        GeneralDetails: formData,
        isCreated: true,
        isBuyer: false,
        UserGuid: Data.registerDetails[0].userGuid,
      });
    } else if (Data.isBuyer === "true") {
      formData = {
        emailId: Data.registerDetails[0].emailId,
        YourName: Data.registerDetails[0].firstName,
        companyName: Data.registerDetails[0].companyName,
        ERPId: Data.registerDetails[0].erpSupplierId,
        userCountryId: Data.registerDetails[0].countryGuid,
        Mobile: Data.registerDetails[0].mobileNumber,
        CompanyRegistrationnumber: Data.registerDetails[0].companyRegistrationNumber,
        IsOTPSent: false,
        isCreated: false,
        isBuyer: true,
        UserGuid: Data.registerDetails[0].userGuid,
        Pancard: Data.registerDetails[0].panCard,
        RoleName: Data.registerDetails[0].roleName
      };
      // console.log("formData", formData);
      this.setState({
        showSignUpPage: false,
        showBusinessType: false,
        showGeneralDetails: true,
        businessTypeName: Data.registerDetails[0].businessTypeName,
        BusinessTypeGuid: Data.registerDetails[0].businessTypeGuid,
        GeneralDetails: formData,
        isCreated: false,
        isBuyer: true,
        UserGuid: Data.registerDetails[0].userGuid,
        RoleName: Data.registerDetails[0].roleName
      });
    } else {
      let formData = {
        emailId: Data.SignUpEmail,
      };
      this.setState({
        showSignUpPage: false,
        showBusinessType: false,
        showGeneralDetails: true,
        GeneralDetails: formData,
      });
    }
  };

  GeneralDetailsPreviousPage = () => {
    this.setState({
      showGeneralDetails: false,
      showBusinessType: false,
      showSignUpPage: true,
      MobileNumber: "",
      confirmationResult: null,
      businessTypeName: "",
    });
  };

  GeneralDetailsNextPage = (Data) => {
    let olddata = this.state.GeneralDetails;
    let IsBuyer = this.state.isBuyer;
    if (
      Data.IsOTPSent
      //  &&
      // Data.recaptchaContainer === null &&
      // Data.confirmationResult !== null
    ) {
      this.setState({
        showGeneralDetails: false,
        showSetPassword: true,
        MobileNumber: Data.Mobile,
        confirmationResult: Data.confirmationResult,
        GeneralDetails: Data,
        YourName: Data.YourName,
        UserEmailID: Data.emailId,
        selectedCountryCode: Data.selectedCountryCode,
        IsOTPVarified: Data.IsOTPVarified,
        ProductTypes: Data.ProductTypes
      });
    } else if (olddata.Mobile === Data.Mobile && this.state.IsOTPVarified) {
      olddata.ERPId = Data.ERPId;
      olddata.companyName = Data.companyName;
      olddata.YourName = Data.YourName;
      olddata.userCountryId = Data.userCountryId;
      olddata.emailId = Data.emailId;
      olddata.Mobile = Data.Mobile;
      olddata.CompanyRegistrationnumber = Data.CompanyRegistrationnumber;
      this.setState({
        showGeneralDetails: false,
        showSetPassword: true,
        GeneralDetails: olddata,
        YourName: Data.YourName,
        UserEmailID: Data.emailId,
        selectedCountryCode: Data.selectedCountryCode,
        IsOTPVarified: Data.IsOTPVarified,
        ProductTypes: Data.ProductTypes
      });
    } else if (IsBuyer) {
      this.setState({ loading: true, showGeneralDetails: false });
      const formData = {};
      uuid = uuidv4();
      let IsCreated = this.state.isCreated;

      if (IsCreated) {
        formData["UserGuid"] = this.state.UserGuid;
      } else if (IsBuyer) {
        formData["UserGuid"] = this.state.UserGuid;
      } else {
        formData["UserGuid"] = uuid;
      }

      formData["EmailId"] = this.state.GeneralDetails["emailId"];
      formData["Password"] = "";
      formData["FirstName"] = this.state.GeneralDetails["YourName"];
      formData["LastName"] = "";
      formData["CompanyName"] = this.state.GeneralDetails["companyName"];
      formData["CompanyWebsite"] = "";
      formData["ParentCompany"] = "";
      formData["ErpsupplierId"] = this.state.GeneralDetails["ERPId"];
      formData["UserAddressLine1"] = "a";
      formData["UserAddressLine2"] = " ";
      formData["UserCountryId"] = this.state.GeneralDetails["userCountryId"];
      // formData["UserStateId"] = "00000000-0000-0000-0000-000000000000";
      formData["UserCity"] = "";
      formData["UserZipcode"] = "0";
      formData["UserPhoneNo"] = this.state.GeneralDetails["Mobile"];
      formData["UserFaxNo"] = "0";
      formData["CompanyAddressLine1"] = " ";
      formData["CompanyAddressLine2"] = " ";
      formData["CompanyCountryId"] = this.state.GeneralDetails["userCountryId"];
      // formData["CompanyStateId"] = "00000000-0000-0000-0000-000000000000";
      formData["CompanyCity"] = " ";
      formData["CompanyZipcode"] = "0";
      formData["CompanyPhoneNo"] = this.state.GeneralDetails["Mobile"];
      formData["CompanyFaxNo"] = "";
      formData["Pancard"] = Data.Pancard;

      // this.setState({
      //   showSetPassword: false,
      //   PasswordDetails: Data,
      //   loading: true,
      //   UserGuid: uuid,
      // });
      var config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "application/json",
          BusinessTypeGuid: this.state.BusinessTypeGuid,
          CompanyRegistrationNumber: this.state.GeneralDetails[
            "CompanyRegistrationnumber"
          ],
          IsCreated: IsCreated,
          "ProductTypes": Data.ProductTypes
        },
      };
      axios
        .post(getServiceUrl() + "Users/RegistrationSupplier?", formData, config)
        .then((response) => {
          if (response.data.saveresult === "success") {
            const updatedGeneralDetailsInfo = {
              ...this.state.GeneralDetails,
            };
            this.setState({
              showGeneralDetails: false,
              showCongratsSupplier: true,
              GeneralDetails: olddata,
              YourName: Data.YourName,
              UserEmailID: Data.emailId,
              selectedCountryCode: Data.selectedCountryCode,
              IsOTPVarified: Data.IsOTPVarified,
              ProductTypes: Data.ProductTypes,
              loading: false
            });

            updatedGeneralDetailsInfo.UserGuid = response.data.userguid;
            var bodyIntegration = {
              //'companyguid': response.data.companyGuid                
            };

            var configIntegration = {
              headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                "companyguid": response.data.companyGuid
              },
            };
            axios
              .post(
                getServiceUrl() + "Integration/SaveSupplier?", bodyIntegration, configIntegration)
              .then((response) => {
                //console.log(response);
                if (response.data.result === "Success") {
                  // console.log("Success From Cpanel API");
                }
              });

            this.setState({
              showSetPassword: false,
              UserEmailID: this.state.GeneralDetails["emailId"],
              GeneralDetails: updatedGeneralDetailsInfo,
              UserGuid: response.data.userguid,
              companyGuid: response.data.companyGuid,
            });
          } else {
            this.setState({ showGeneralDetails: true });
            toaster.notify(toasterAlert("WARNING", response.data.saveresult), {
              duration: null,
            });
          }
        })
        .catch((err) => {
          this.setState({ loading: false });
        });

    }
  };

  // OTPPreviousPage = () => {
  //     this.setState({ showOTP: false, showGeneralDetails: true })
  // }

  // OTPNextPage = (Data) => {
  //     if (Data.IsOTPVarified) {
  //         this.setState({ showOTP: true, showSetPassword: false, IsOTPVarified: Data.IsOTPVarified })
  //     }
  // }

  SetPasswordPreviousPage = () => {
    this.setState({ showGeneralDetails: true, showSetPassword: false });
  };

  SetPasswordNextPage = (Data) => {
    if (Data !== undefined && Data !== null) {
      this.setState({ loading: true });
      const formData = {};
      uuid = uuidv4();
      let IsCreated = this.state.isCreated;
      if (IsCreated) {
        formData["UserGuid"] = this.state.UserGuid;
      }
      // else {
      //   formData["UserGuid"] = '';
      // }      

      formData["EmailId"] = this.state.GeneralDetails["emailId"];
      formData["Password"] = Data.password;
      formData["FirstName"] = this.state.GeneralDetails["YourName"];
      formData["LastName"] = "";
      formData["CompanyName"] = this.state.GeneralDetails["companyName"];
      formData["CompanyWebsite"] = "";
      formData["ParentCompany"] = "";
      formData["ErpsupplierId"] = this.state.GeneralDetails["ERPId"];
      formData["UserAddressLine1"] = "a";
      formData["UserAddressLine2"] = " ";
      formData["UserCountryId"] = this.state.GeneralDetails["userCountryId"];
      // formData["UserStateId"] = "00000000-0000-0000-0000-000000000000";
      formData["UserCity"] = "";
      formData["UserZipcode"] = "0";
      formData["UserPhoneNo"] = this.state.GeneralDetails["Mobile"];
      formData["UserFaxNo"] = "0";
      formData["CompanyAddressLine1"] = " ";
      formData["CompanyAddressLine2"] = " ";
      formData["CompanyCountryId"] = this.state.GeneralDetails["userCountryId"];
      // formData["CompanyStateId"] = "00000000-0000-0000-0000-000000000000";
      formData["CompanyCity"] = " ";
      formData["CompanyZipcode"] = "0";
      formData["CompanyPhoneNo"] = this.state.GeneralDetails["Mobile"];
      formData["CompanyFaxNo"] = "";
      formData["Pancard"] = this.state.GeneralDetails["Pancard"];

      this.setState({
        showSetPassword: false,
        PasswordDetails: Data,
        loading: true,
        UserGuid: uuid,
      });
      var config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "application/json",
          BusinessTypeGuid: this.state.BusinessTypeGuid,
          CompanyRegistrationNumber: this.state.GeneralDetails[
            "CompanyRegistrationnumber"
          ],
          IsCreated: IsCreated,
          "ProductTypes": this.state.ProductTypes
        },
      };

      axios
        .post(getServiceUrl() + "Users/RegistrationSupplier?", formData, config)
        .then((response) => {
          this.setState({ loading: false });
          if (response.data.saveresult === "success") {
            const updatedGeneralDetailsInfo = {
              ...this.state.GeneralDetails,
            };
            updatedGeneralDetailsInfo.UserGuid = response.data.userguid;
            var bodyIntegration = {
              //'companyguid': response.data.companyGuid                
            };

            var configIntegration = {
              headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                "companyguid": response.data.companyGuid
              },
            };
            axios
              .post(
                getServiceUrl() + "Integration/SaveSupplier?", bodyIntegration, configIntegration)
              .then((response) => {
                //console.log(response);
                if (response.data.result === "Success") {
                  // console.log("Success From Cpanel API");
                }
              });

            this.setState({
              showSetPassword: false,
              showVerifyEmail: false,
              showCongratsSupplier: true,
              UserEmailID: this.state.GeneralDetails["emailId"],
              GeneralDetails: updatedGeneralDetailsInfo,
              UserGuid: response.data.userguid,
              companyGuid: response.data.companyGuid,
            });
          } else {
            this.setState({ showSetPassword: true });
            toaster.notify(toasterAlert("WARNING", response.data.saveresult), {
              duration: null,
            });
          }
        })
        .catch((err) => {
          this.setState({ loading: false });
        });
    }
  };

  VerifyMailNextPage = () => {
    this.setState({ showVerifyEmail: false, showCongratsSupplier: true });
  };

  CongratsSupplierHomePage = () => {
    this.context.router.history.push("/");
  };

  CongratsSupplierSubmitDocument = () => {
    const formData = {};
    formData["EmailId"] = this.state.UserEmailID;
    formData["Password"] = this.state.PasswordDetails.password;
    // this.context.router.history.push('/');
    localStorage.setItem("IsSubmitDocument", "true");
    localStorage.setItem("userType", "\"autolog\"");
    localStorage.setItem("autoLoginCheck", "true");
    //this.props.history.push("/edit-profile")
    this.props.onAuth(formData, this.props);
  };

  onCompleteProfilePage = () => {
    const formData = {};
    let password = this.state.PasswordDetails.password;
    formData["EmailId"] = this.state.UserEmailID;
    formData["Password"] = this.state.PasswordDetails.password;
    localStorage.setItem("IsSubmitDocument", "false");
    localStorage.setItem("userType", "\"autolog\"");
    localStorage.setItem("autoLoginCheck", "true");
    //this.props.history.push("/edit-profile") 
    this.props.onAuth(formData, this.props);
  };

  render() {
    if (
      localStorage.getItem("IsAuthentic") === "true" ||
      localStorage.getItem("IsAuthentic") === true
    ) {
      return <Redirect to="/home" />;
    }

    const { resources } = this.state;

    return (
      <React.Fragment>
        {/* {this.state.showSignUpPage ? '' : <div className="nonLogin_bg"></div>} */}
        <div style={{ 'padding': this.state.showSignUpPage ? '0px' : '', 'margin': this.state.showSignUpPage ? '-120px 0px 0' : '0px' }} className=" signUpOnboarding">
          {this.state.showSignUpPage ? (
            <div className="form_components">
              <SupplierSignUp onNextPage={this.SupplierSignUpNextPage} />
            </div>
          ) : (
              ""
            )}

          {this.state.showBusinessType ? (
            <React.Fragment>
              <div className="steps_text">
                <h4>The first step toward change is awareness.</h4>
                <p>Step 1 of 4</p>
              </div>
              <div className="form_components">
                <div className="form_left">
                  <div className="businessTypeSignup">
                    {/* <h4>
                {getLabelText(
                  resources.filter((x) => {
                    return x.resourceKey === "signupinfo1";
                  })[0],
                  "SIGN UP"
                )}
              </h4> */}
                    <p>
                      {getLabelText(
                        resources.filter((x) => {
                          return x.resourceKey === "signupinfo2";
                        })[0],
                        "You would like to sign up as"
                      )}
                    </p>
                    <span>Supply chain partner</span>
                  </div>
                  <div className="signup_type">
                    <div className="main_img">
                      {/* <img alt=" " src={InfinityImg} /> */}
                      <div className="subImg">
                        {this.state.contentState.map((data, i) => {
                          return (
                            <div
                              className={data.isActive ? "isActive" : "isNonActive"}
                            >
                              {data.isActive ? (
                                <div
                                  onClick={(event) =>
                                    this.OpenStagePage(
                                      event,
                                      data.businessTypeName,
                                      data.businessTypeGuid
                                    )
                                  }
                                >
                                  {/* <Tooltip id="businessTypeNames" title={data.businessTypeName}> */}
                                  <img
                                    alt=" "
                                    src={
                                      getAWSUrl() + "SupplierOnBoarding/Icons/" + data.image
                                    }
                                  /><span>{data.businessTypeName}</span>
                                  {/* </Tooltip> */}
                                </div>
                              ) : (
                                  <div>
                                    {/* <Tooltip id="businessTypeNames" title={data.businessTypeName}> */}
                                    <img
                                      alt=" "
                                      src={
                                        getAWSUrl() + "SupplierOnBoarding/Icons/" + data.image
                                      }
                                    /><span>{data.businessTypeName}</span>
                                    {/* </Tooltip> */}
                                  </div>
                                )}
                            </div>
                          );
                        })}

                        {/* <div className="isNonActive">
                            <h6>Logistics Partner</h6>
                            <img alt=" " src={LogisticPartnerImg} />
                        </div>*/}
                      </div>
                    </div>
                    {/* <div className="bottom_icons">
                <img alt=" " src={Bottom1} />
                <img alt=" " src={Bottom2} />
                <img alt=" " src={Bottom3} />
              </div> */}
                  </div>
                </div>
                <div className="form_right">
                  <div>
                    <img src={formRightIcon1} />
                  </div>
                  <div>
                    <p>Zero Carbon Economy is now a <span className="">business priority</span></p>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ) : (
              ""
            )}

          {this.state.showGeneralDetails ? (
            <React.Fragment>
              <div className="steps_text">
                <h4>Let us know about your company.</h4>
                <p>Step 2 of 4</p>
              </div>
              <div className="form_components genDetails_form_right">
                <div className="form_left">
                  <GeneralDetails
                    getDetails={this.state.GeneralDetails}
                    onNextPage={this.GeneralDetailsNextPage}
                    onPreviousPage={this.GeneralDetailsPreviousPage}
                    IsEditProfile={false}
                  />
                </div>
                <div className="form_right">
                  <div>
                    <img src={formRightIcon1} />
                  </div>
                  <div>
                    <p>Zero Carbon Economy is now a <span className="">business priority</span></p>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ) : (
              ""
            )}

          {this.state.showSetPassword ? (
            <React.Fragment>
              <div className="steps_text">
                <h4>Create your password</h4>
                <p>Step 2 of 4</p>
              </div>
              <div className="form_components create_password">
                <div className="form_left">
                  <CreatePassword
                    onPreviousPage={this.SetPasswordPreviousPage}
                    onNextPage={this.SetPasswordNextPage}
                  />
                </div>
                <div className="form_right">
                  <div>
                    <img src={formRightIcon1} />
                  </div>
                  <div>
                    <p><span>79%</span> Consumers prefer <span>environment conscious</span> brands</p>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ) : (
              ""
            )}
          {this.state.showVerifyEmail ? (
            <React.Fragment>
              <div className="steps_text">
                <h4>Update your email Id.</h4>
                <p>Step 3 of 4</p>
              </div>
              <div className="form_components verifyMail">
                <div className="form_left">
                  <VerifyEmail
                    isCreated={this.state.isCreated}
                    UserEmailID={this.state.UserEmailID}
                    UserGuid={this.state.UserGuid}
                    onNextPage={this.VerifyMailNextPage}
                  />
                </div>
                <div className="form_right">
                  <div>
                    <img src={formRightIcon1} />
                  </div>
                  <div>
                    <p><span>79%</span> Consumers prefer <span>environment conscious</span> brands</p>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ) : (
              ""
            )}

          {this.state.showCongratsSupplier ? (
            <React.Fragment>
              <div className="steps_text">
                <h4>Congratulations, {this.state.YourName}!</h4>
                <p>Step 4 of 4</p>
              </div>
              <div className="form_components congrats_supplier">
                <div className="form_left">
                  <CongratsSupplier
                    BusinessTypeName={this.state.businessTypeName}
                    YourName={this.state.YourName}
                    CompanyName={this.state.GeneralDetails["companyName"]}
                    onCompleteProfilePage={this.onCompleteProfilePage}
                    onHomePage={this.CongratsSupplierHomePage}
                    onSubmitDocument={this.CongratsSupplierSubmitDocument}
                    isBuyer={this.state.isBuyer}
                  />
                </div>
                <div className="form_right">
                  <div>
                    <img src={formRightIcon1} />
                  </div>
                  <div>
                    <p><span>79%</span> Consumers prefer <span>environment conscious</span> brands</p>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ) : (
              ""
            )}

          {/* {this.state.showGeneralDetails ?
                    <div className="form_components">
                        <EnterPriseDetails/>
                    </div> : ""} */}

          {/* {this.state.showSignUpPage ?
                    <div className="form_components">
                        <FacilityDetails/>
                    </div> : ""} */}

          {/* {this.state.showSignUpPage ?
                    <div className="form_components">
                        <SustainabilityDocuments/>
                    </div> : ""} */}

          <div style={{ display: this.state.loading ? "block" : "none" }}>
            <div className="form_components">
              <Spinner />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loading: state.login.loading,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    onAuth: (formData, history) =>
      dispatch(actionCreators.authAutoLogin(formData, history)),
  };
};
// export default SupplierOnBoarding

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SupplierOnBoarding);
