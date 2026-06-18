import axios from "axios";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import toaster from "toasted-notes";
import { v4 as uuidv4 } from "uuid";
import Spinner from "../../UI/Spinner/Spinner";
import congrats_bg from "../../assets/img/Signuponboarding/congrats_bg.png";
import onboarding1 from "../../assets/img/Signuponboarding/onboarding1.png";
import CongratsSupplier from "../../components/SupplierOnBoarding/CongratsSupplier";
import CreatePassword from "../../components/SupplierOnBoarding/CreatePassword";
import GeneralDetails from "../../components/SupplierOnBoarding/GeneralDetailsNew";
import {
  getGlobalSettings,
  getLabelText,
  getLanguageResourceElasticIndex,
  getNextJSServiceUrl,
  getServiceUrl,
  getWebsiteLanguageGuid,
  getWebsiteUrl,
} from "../../config";
import * as actionCreators from "../../store/actions/index";
import { getPageResourceAsync, toasterAlert, sanitiseValuesByTypeOfData } from "../../utility";
import {
  ReCaptchaContext,
  captchaValidation,
} from "../../google-invisible-recaptcha/RecaptchaProvider";
import { detect } from "detect-browser";
import RightSideImg from "../../assets/img/rightside-img.png";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";

let uuid = null;

const awsUrl = getWebsiteUrl();

var countryIndia = "";
const globalCountries = () => {
  getGlobalSettings("COUNTRYNAME").then(function(result) {
    if (result !== undefined) {
      countryIndia = result.data.hits.hits[0]._source.settingsValue;
    }
  });
};
var regCountryName = "";
class SupplierOnBoardingNew extends Component {
  static contextType = ReCaptchaContext;
  static contextTypes = {
    router: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      contentState: [],
      showGeneralDetails: false,
      showSetPassword: true,
      showCongratsSupplier: false,
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
      YourName: "",
      loading: false,
      fullLoading: true,
      isDataValid: "",
      isCreated: false,
      roleName: "",
      selectedCountryCode: "",
      ProductTypes: [],
      BusinessTypeGuid: null,
      isBuyer: false,
      ManageCreatePassword: null,
      OldEmailId: "",
      BusinessTypeText: "",
      IsEmailVerified: false,
      IsMobileVerified: false,
      Ucountryname: "",
      Ucountrycode: "",
      languageResources: [],
    };
  }

  componentDidMount() {
    globalCountries();
    this.getLanguageResource();
  }

  async getLanguageResource() {
    await getPageResourceAsync(
      getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), "registration")
    )
      .then((json) => {
        this.setState({ languageResources: json });
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/")
            : ""
          : ""
      );
  }
  GeneralDetailsNextPage = (Data) => {
    this.setState({
      showGeneralDetails: false,
      showSetPassword: true,
      MobileNumber: Data.Mobile,
      GeneralDetails: Data,
      YourName: Data.YourName,
      UserEmailID: Data.emailId,
      selectedCountryCode: Data.selectedCountryCode,
      BusinessTypeGuid: Data.BusinessTypeGuid,
      UserGuid: Data.userGuid !== "" ? Data.userGuid : null,
      isCreated: Data.companyStatus === "Created" ? true : false,
      OldEmailId: Data.OldEmailId,
      BusinessTypeText: Data.BusinessTypeText,
    });
  };
  GeneralDetailsPreviousPage = () => {
    window.location.href = "/";
  };
  
  onFullLoadingChange = (isLoading) => {
    console.log("onFullLoadingChange called");
    
    this.setState({ fullLoading: isLoading });
  };
  
  onDataValidChange = (isValid) => {
    this.setState({ isDataValid: isValid });
  };
  
  SetPasswordPreviousPage = (Data) => {
    this.setState({
      showGeneralDetails: true,
      showSetPassword: false,
      GeneralDetails: Data,
      ManageCreatePassword: Data,
      IsEmailVerified: Data.IsEmailVerified,
      IsMobileVerified: Data.IsMobileVerified,
    });
  };
  getUrlParameter = (sParam) => {
    var sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split("&"),
      sParameterName,
      i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split("=");

      if (sParameterName[0] === sParam) {
        return typeof sParameterName[1] === undefined
          ? true
          : decodeURIComponent(sParameterName[1]);
      }
    }
    return false;
  };

  fileupload = async (UploadType, file, userId, companyGuid) => {
    try {
      this.setState({ loading: true });
      const formData = new FormData();
      formData.append("files", file);
      var config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "multipart/form-data",
          UploadType: UploadType,
          UserGuid: userId,
          FolderName: "CompanyAccountDetails",
          facilityGuid: companyGuid,
        },
      };
      // await axios
      //   .post(getServiceUrl() + "FileUpload/uploadfile", formData, config)
      //   .then((response) => {
      //     this.setState({ loading: false });
      //   })
      //   .catch((err) => {
      //     this.setState({ loading: false });
      //     console.log(err);
      //   });
    } catch (error) {
      this.setState({ loading: false });
    }
  };
  
  SetPasswordNextPage = async (Data) => {
    const isCaptchaValid = await captchaValidation(this.context);
    if (isCaptchaValid) {
      if (
        Data.ManageGeneralDetail !== undefined &&
        Data.ManageGeneralDetail !== null &&
        Data.MangePasswordDetail !== undefined &&
        Data.MangePasswordDetail !== null
      ) {
        this.setState({
          loading: true,
          YourName: Data.ManageGeneralDetail.YourName.value,
        });
        const formData = {};
        uuid = uuidv4();
        let IsCreated = Data.IsCreated === true ? true : false;
        //let IsCreated = this.state.isCreated;
        if (IsCreated) {
          formData["UserGuid"] = sanitiseValuesByTypeOfData(this.state.UserGuid);
        }
        
        const params = this.getUrlParameter("companyid");
        
        if (params !== null && params) {
          formData["CPanelCompanyId"] = sanitiseValuesByTypeOfData(params);
          formData["OldEmailId"] = sanitiseValuesByTypeOfData(this.state.OldEmailId);
        }
        // debugger;

        formData["EmailId"] = sanitiseValuesByTypeOfData(Data.ManageGeneralDetail.emailId.value);
        formData["Password"] = sanitiseValuesByTypeOfData(Data.MangePasswordDetail.password.value);
        formData["FirstName"] = sanitiseValuesByTypeOfData(Data.ManageGeneralDetail.YourName.value);
        formData["LastName"] = "";
        formData["CompanyName"] = sanitiseValuesByTypeOfData(Data.ManageGeneralDetail.companyName.value);
        formData["CompanyWebsite"] = sanitiseValuesByTypeOfData(Data.ManageGeneralDetail.WebsiteURL.value);
        formData["ParentCompany"] = "";
        formData["ErpsupplierId"] = "";
        formData["UserAddressLine1"] = "a";
        formData["UserAddressLine2"] = " ";
        formData["UserCountryId"] =
          localStorage.SelectedCountryCode === undefined ||
          localStorage.SelectedCountryCode === null ||
          localStorage.SelectedCountryCode === ""
            ? "26af1dcd-47ed-4e24-bd16-4957d626f1f7"
            : localStorage.SelectedCountryCode; // Data.ManageGeneralDetail.userCountryId.value;
        formData["UserCity"] = "";
        formData["UserZipcode"] = "0";
        formData["UserPhoneNo"] = sanitiseValuesByTypeOfData(Data.ManageGeneralDetail.Mobile.value);
        formData["UserFaxNo"] = "0";
        formData["CompanyAddressLine1"] = " ";
        formData["CompanyAddressLine2"] = " ";
        formData["CompanyCountryId"] =
          localStorage.SelectedCountryCode === undefined ||
          localStorage.SelectedCountryCode === null ||
          localStorage.SelectedCountryCode === ""
            ? "26af1dcd-47ed-4e24-bd16-4957d626f1f7"
            : localStorage.SelectedCountryCode; //Data.ManageGeneralDetail.userCountryId.value;
        formData["CompanyCity"] = " ";
        formData["CompanyZipcode"] = "0";
        formData["CompanyPhoneNo"] = sanitiseValuesByTypeOfData(Data.ManageGeneralDetail.Mobile.value);
        formData["CompanyFaxNo"] = "";
        formData["Pancard"] =
          regCountryName === countryIndia
            ? sanitiseValuesByTypeOfData(Data.ManageGeneralDetail.PAN.DocumentValue)
            : "";
        formData["GSTNumber"] =
          sanitiseValuesByTypeOfData(Data.ManageGeneralDetail.GSTNumber.DocumentValue);
        formData["YearEstablished"] =
          Data.ManageGeneralDetail.EstablishedIn.value !== ""
            ? sanitiseValuesByTypeOfData(Data.ManageGeneralDetail.EstablishedIn.value[0])
            : sanitiseValuesByTypeOfData(Data.ManageGeneralDetail.EstablishedIn.value);
        formData["LegalStructureGuid"] =
          sanitiseValuesByTypeOfData(Data.ManageGeneralDetail.LegalStructure.value);
        formData["PancardDocument"] = sanitiseValuesByTypeOfData(Data.ManageGeneralDetail.PAN.DocumentName);
        formData["GSTDocument"] =
          sanitiseValuesByTypeOfData(Data.ManageGeneralDetail.GSTNumber.DocumentName);
        formData["OldEmailId"] =
          this.state.OldEmailId !== null && this.state.OldEmailId !== undefined
            ? sanitiseValuesByTypeOfData(this.state.OldEmailId)
            : "";
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
            //BusinessTypeGuid: this.state.BusinessTypeGuid,
            BusinessTypeGuid: sanitiseValuesByTypeOfData(Data.ManageGeneralDetail.partnerType.value),
            CompanyRegistrationNumber: sanitiseValuesByTypeOfData(Data.ManageGeneralDetail.CINCRN.value),
            IsCreated: IsCreated,
            ProductTypes: [],
          },
        };
        const options = {
          method: "POST",
          url: getNextJSServiceUrl() + "registration/RegistrationSupplierNew",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
            Authorization: "Bearer " + localStorage.tokenId,
          },
          data: formData,
        };
        await axios
          .request(options)
          .then((response) => {
            this.setState({ loading: false });

            if (response.data.saveresult === "success") {
              this.fileupload(
                "SupplierBank",
                Data.ManageGeneralDetail.GSTNumber.Document,
                response.data.userguid,
                response.data.companyGuid
              );
              this.fileupload(
                "SupplierBank",
                Data.ManageGeneralDetail.PAN.Document,
                response.data.userguid,
                response.data.companyGuid
              );
              localStorage.removeItem("selectedCountryCode"); //local storage removed
              localStorage.removeItem("SelectedCountryname"); //local storage removed
              this.setState({
                showSetPassword: false,
                showVerifyEmail: false,
                showCongratsSupplier: true,
                UserEmailID: Data.ManageGeneralDetail.emailId.value,
                Password: Data.MangePasswordDetail.password.value,
                UserGuid: response.data.userguid,
                companyGuid: response.data.companyGuid,
              });
            } else {
              this.setState({ showSetPassword: true });
              toaster.notify(
                toasterAlert(
                  "WARNING",
                  "Something went wrong. Please try again."
                ),
                {
                  duration: null,
                }
              );
            }
          })
          .catch((err) => {
            if (err.response.status === 429) {
              // Rate limit error
              localStorage.setItem("toManyRequestMessage", "Too many registration attempts. Please try again later.");
            }
            console.log(err);
            this.setState({
              showSetPassword: false,
              showVerifyEmail: false,
              showCongratsSupplier: true,
              UserEmailID: Data.ManageGeneralDetail.emailId.value,
              Password: Data.MangePasswordDetail.password.value,
              loading: false,
            });
            //this.setState({ loading: false, showSetPassword: true });
          });
      }
    } else {
      alert("Captcha verification failed. Please try again.");
    }
  };
  CongratsSupplierSubmitDocument = () => {
    const browser = detect();
    const formData = {};
    formData["EmailId"] = this.state.UserEmailID;
    formData["Password"] = this.state.Password;
    formData["BrowserToken"] = localStorage.getItem("BrowserToken");
    formData["BrowserName"] = browser.name;
    // this.context.router.history.push('/');
    localStorage.setItem("IsSubmitDocument", "true");
    localStorage.setItem("userType", '"autolog"');
    localStorage.setItem("autoLoginCheck", "true");
    //this.props.history.push("/edit-profile")
    this.props.onAuth(formData, this.props);
  };
  onCompleteProfilePage = () => {
    const formData = {};
    let password = this.state.PasswordDetails.password;
    formData["EmailId"] = this.state.UserEmailID;
    formData["Password"] = this.state.Password;
    localStorage.setItem("IsSubmitDocument", "false");
    localStorage.setItem("userType", '"autolog"');
    localStorage.setItem("autoLoginCheck", "true");
    //this.props.history.push("/edit-profile")
    this.props.onAuth(formData, this.props);
  };
  render() {
    
    if (localStorage.SelectedCountryname === undefined) {
      regCountryName = localStorage.userCountryName;
    } else {
      regCountryName = localStorage.SelectedCountryname;
    }
    if (
      localStorage.getItem("IsAuthentic") === "true" ||
      localStorage.getItem("IsAuthentic") === true
    ) {
      return <Redirect to="/home" />;
    }

    if(this.state.isDataValid === null){
      return(
        <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999
            }}>
              <Spinner />
            </div>
      )
    }

    const { resources } = this.state;
    return (
      <React.Fragment>
        <div style={{ display: this.state.fullLoading ? "block" : "none" }}>
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999
            }}>
              <Spinner />
            </div>
          </div>

        <div className="signUpOnboarding">
          {(this.state.showCongratsSupplier || !this.state.loading) &&
          <GridContainer className="login_form_parent" justify="flex-start" style={{ minHeight: '100vh', alignItems: 'center', display: 'flex', paddingLeft: 80, paddingRight: 68 }}>
            <GridItem md={6}>
              <img
                style={{ width: "240px", height: "37.45px" }}
                alt={awsUrl + "CompanyLogo.svg"}
                src={awsUrl + "CompanyLogo.svg"}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "";
                }}
              />
              {this.state.showGeneralDetails ? (
                <React.Fragment>
                  <div className="steps_text">
                    <h4>Register to join the Snowkap Community.</h4>
                    <div className="steps_text_border">
                      <div style={{ backgroundColor: "#008522" }} />
                      <div />
                      <div />
                    </div>
                  </div>
                  <div className="form_components genDetails_form_right">
                    <div className="form_left">
                      <GeneralDetails
                        getDetails={this.state.GeneralDetails}
                        onNextPage={this.GeneralDetailsNextPage}
                        onPreviousPage={this.GeneralDetailsPreviousPage.bind(this)}
                        IsEditProfile={false}
                        IsEmailVerified={this.state.IsEmailVerified}
                        IsMobileVerified={this.state.IsMobileVerified}
                        // fullLoading={this.state.fullLoading}
                        onFullLoadingChange={this.onFullLoadingChange}
                        onDataValidChange={this.onDataValidChange}
                      />
                    </div>
                    {/* <div className="form_right">
                      <div className="registration_form_right"> */}
                        {/* <img src={onboarding1} /> */}
                        {/* <p>
                          According to Mckinsey survey, due to COVID-19 the consumer
                          concern in India with regards to hygiene and food safety
                          of packaging reveals that 94% are more concerned, 4% are
                          less concerned and 2% are the same
                        </p> */}
                        {/* <img
                          alt="Turning Climate Complexity Into Business Clarity"
                          src={RightSideImg}
                          style={{ height: "94vh", padding: window.innerWidth <= 1366 ? "45px 0px 47px" : "39px 0px 47px" }}
                        />
                      </div>
                    </div> */}
                  </div>
                </React.Fragment>
              ) : (
                ""
              )}
              {this.state.showSetPassword ? (
                <React.Fragment>
                  <div className="steps_text">
                    <h4>
                      {/* Hello{" "}
                      {this.state.GeneralDetails !== null &&
                      this.state.GeneralDetails !== undefined
                        ? this.state.GeneralDetails.YourName
                        : ""}
                      , complete your registration */}
                      <h4>Register to join the Snowkap Community.</h4>
                    </h4>
                    <div className="steps_text_border">
                      <div style={{ backgroundColor: "#008522" }} />
                      <div style={{ backgroundColor: "#008522" }} />
                      <div />
                    </div>
                    {regCountryName === countryIndia ? (
                      <p style={{ marginTop: "8px", display: "none" }}>
                        Please upload GST Certificate & PAN Card for the shown
                        company details and share additional info, if you have.
                      </p>
                    ) : (
                      <p style={{ marginTop: "8px", display: "none" }}>
                        {this.state.languageResources !== null
                          ? getLabelText(
                              this.state.languageResources.filter((x) => {
                                return (
                                  x.resourceKey === "pleaseuploadlicensesentence"
                                );
                              })[0],
                              "Please upload License for the shown company details and share additional info, if you have."
                            )
                          : ""}
                      </p>
                    )}
                  </div>
                  <div className="form_components genDetails_form_right">
                    <div className="form_left">
                      <CreatePassword
                        getGeneralDetails={this.state.GeneralDetails}
                        getManageCreatePassword={this.state.ManageCreatePassword}
                        onPreviousPage={this.SetPasswordPreviousPage}
                        onNextPage={this.SetPasswordNextPage}
                        onFullLoadingChange={this.onFullLoadingChange}
                        onDataValidChange={this.onDataValidChange}
                      />
                    </div>
                    {/* <div className="form_right">
                      <div className="registration_form_right">
                        <img
                          alt="Turning Climate Complexity Into Business Clarity"
                          src={RightSideImg}
                          style={{ height: "94vh", padding: window.innerWidth <= 1366 ? "45px 0px 47px" : "39px 0px 47px" }}
                        /> */}
                        {/* <img src={onboarding1} /> */}
                        {/* <p>
                          According to Mckinsey survey, due to COVID-19 the consumer
                          concern in India with regards to hygiene and food safety
                          of packaging reveals that 94% are more concerned, 4% are
                          less concerned and 2% are the same
                        </p> */}
                      {/* </div>
                    </div> */}
                  </div>
                </React.Fragment>
              ) : (
                ""
              )}
              {this.state.showCongratsSupplier ? (
                <React.Fragment>
                  <div className="steps_text congrate_head">
                    <h4>
                      Welcome to Snowkap,{" "}
                      <span style={{ textTransform: "capitalize" }}>
                        {this.state.YourName.trim()}!!
                      </span>
                    </h4>
                    <div className="steps_text_border">
                      <div style={{ backgroundColor: "#008522" }} />
                      <div style={{ backgroundColor: "#008522" }} />
                      <div style={{ backgroundColor: "#008522" }} />
                    </div>
                  </div>
                  <div className="form_components genDetails_form_right">
                    <div className="form_left">
                      <CongratsSupplier
                        BusinessTypeName={this.state.businessTypeName}
                        YourName={this.state.YourName} // CompanyName={this.state.GeneralDetails["companyName"]}
                        CompanyName="sample test"
                        onCompleteProfilePage={this.onCompleteProfilePage}
                        onHomePage={this.CongratsSupplierHomePage}
                        onSubmitDocument={this.CongratsSupplierSubmitDocument}
                        isBuyer={this.state.isBuyer}
                        BusinessTypeText={this.state.BusinessTypeText}
                      />
                    </div>
                    {/* <div className="form_right">
                      <div className="registration_form_right"> */}
                        {/* <img src={congrats_bg} /> */}
                        {/* <img
                          alt="Turning Climate Complexity Into Business Clarity"
                          src={RightSideImg}
                          style={{ height: "94vh", padding: window.innerWidth <= 1366 ? "45px 0px 47px" : "39px 0px 47px" }}
                        />
                      </div>
                    </div> */}
                  </div>
                </React.Fragment>
              ) : (
                ""
              )}
          </GridItem>
          <GridItem md={6} style={{paddingRight:0}}>
              <div className="" style={{ display: "flex", justifyContent: "flex-end" }}>
                {/* <img src={congrats_bg} /> */}
                <img
                  alt="Turning Climate Complexity Into Business Clarity"
                  src={RightSideImg}
                  style={{ height: "99vh", padding: "45px 0" }}
                />
              </div>
            </GridItem>
          </GridContainer>}
          <div style={{ display: !this.state.showCongratsSupplier ? (this.state.loading ? "block" : "none") : "none" }}>
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 9999
            }}>
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
)(SupplierOnBoardingNew);
