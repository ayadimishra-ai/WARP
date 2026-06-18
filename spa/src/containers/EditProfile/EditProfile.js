import axios from 'axios';
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import toaster from 'toasted-notes';
import formRightIcon1 from "../../assets/img/Signuponboarding/formRightIcon1.png";
import EnterPriseDetails from '../../components/SupplierOnBoarding/EnterPriseDetails';
import FacilityDetails from '../../components/SupplierOnBoarding/FacilityDetails';
import GeneralDetails from "../../components/SupplierOnBoarding/GeneralDetails";
import OTP from "../../components/SupplierOnBoarding/OtpComponet";
import SustainabilityDocuments from '../../components/SupplierOnBoarding/SustainabilityDocuments';
import { getAWSUrl, getLabelText, getLanguageResourceElasticIndex, getServiceUrl, getWebsiteLanguageGuid } from '../../config';
import * as RoleCodes from "../../rolecodes";
import Button from "../../UI/Button/MaterialButton";
import Spinner from '../../UI/Spinner/Spinner';
import { getPageResource, toasterAlert } from "../../utility";


let uuid = null;

class EditProfile extends Component {
    static contextTypes = {
        router: PropTypes.object
    }
    constructor(props) {
        super(props)
        this.state = {
            contentState: [],
            showBusinessType: true,
            showGeneralDetails: false,
            showOTP: false,
            showSetPassword: false,
            businessTypeName: "",
            BusinessTypeGuid: null,
            resources: [],
            GeneralDetails: null,
            MobileNumber: "",
            confirmationResult: "",
            IsOTPVarified: false,
            UserEmailID: "",
            UserGuid: null,
            YourName: "",
            loading: false,
            isCreated: false,
            selectedCountryCode: "",
            resources: [],
            showEnterpriseDetails: false,
            companyName: "",
            showFacilityDetails: false,
            showSustainabilityDetails: false,
            IsBusinessTypeSkip: false,
            IsEditDetails: true,
            SelectedbusinessTypeName: "",
            SelectedBusinessTypeGuid: null,
        }
    }

    componentDidMount() {
        if (localStorage.userStatus === "Documents Submitted" || localStorage.userStatus === "Response Received" || localStorage.userStatus === "Account Approval Pending" || localStorage.userStatus === "Response Received for Approval" || localStorage.userStatus === "Account Approved") {
            this.setState({ IsEditDetails: false });
        }
        this.loadData();
        this.getLanguageResource();
        this.getExistingDetails();
        let IsSubmitDocument = localStorage.IsSubmitDocument;
        if (IsSubmitDocument !== undefined) {
            if (IsSubmitDocument === "true") {
                localStorage.setItem("IsSubmitDocument", "false");
                this.setState({ showBusinessType: false, showEnterpriseDetails: true })
            }
            else {
                // localStorage.setItem("IsSubmitDocument", "true");
                this.setState({ showBusinessType: true, showEnterpriseDetails: false })
            }
        }
    }
    getExistingDetails() {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                userGuid: localStorage.userId
            },
        };

        axios.get(getServiceUrl() + 'Users/GetProfileDetails', config)
            .then((response) => {
                this.setState({ loading: false });
                if (response.data.status200OK) {
                    if (response.data.registerDetails != null) {
                        if (response.data.registerDetails.length > 0) {
                            if (this.state.IsBusinessTypeSkip) {
                                this.setState({
                                    businessTypeName: response.data.registerDetails[0].businessTypeName,
                                    BusinessTypeGuid: response.data.registerDetails[0].businessTypeGuid
                                });
                            }
                            this.setState({
                                SelectedbusinessTypeName: response.data.registerDetails[0].businessTypeName,
                                SelectedBusinessTypeGuid: response.data.registerDetails[0].businessTypeGuid
                            });
                            let formData1 = {};
                            formData1 = {
                                'emailId': response.data.registerDetails[0].emailId,
                                'YourName': response.data.registerDetails[0].firstName,
                                'companyName': response.data.registerDetails[0].companyName,
                                'ERPId': response.data.registerDetails[0].erpSupplierId,
                                'userCountryId': response.data.registerDetails[0].countryGuid,
                                'Mobile': response.data.registerDetails[0].mobileNumber,
                                'CompanyRegistrationnumber': response.data.registerDetails[0].companyRegistrationNumber,
                                'IsOTPSent': false,
                                'isCreated': true,
                                'UserGuid': response.data.registerDetails[0].userGuid,
                                'status': response.data.registerDetails[0].status,
                                'Pancard': response.data.registerDetails[0].panCard
                            };

                            this.setState({ GeneralDetails: formData1, UserGuid: response.data.registerDetails[0].userGuid, companyName: response.data.registerDetails[0].companyName });
                        }
                    }
                }
            }).catch(err => {
                this.setState({ loading: false });
            });



    }

    getLanguageResource() {
        getPageResource(getLanguageResourceElasticIndex(getWebsiteLanguageGuid(), 'supplierOnBoarding'))
            .then(json => {
                this.setState({ resources: json });
            }).catch(err => err.response !== undefined ? err.response.status === 401 ? window.location.pathname = '/' : '' : '');

    }

    loadData = () => {
        var config = {
            headers: {
                "Authorization": "Bearer " + localStorage.tokenId,
                'Content-Type': 'application/json'
            },
        };
        // axios.get(getServiceUrl() + 'Users/GetBusinessTypes', config)
        //     .then((response) => {
        //         this.setState({ contentState: response.data });
        //     }).catch((err) =>
        //         err.response !== undefined ? err.response.status === 401 ? console.log(err) : '' : ''
        //     );
    }

    OpenStagePage = (event, BusinessTypeName, BusinessTypeGuid) => {
        this.getExistingDetails();
        if (BusinessTypeName !== undefined && BusinessTypeName !== '') {
            this.setState({ showGeneralDetails: true, showBusinessType: false, businessTypeName: BusinessTypeName, BusinessTypeGuid: BusinessTypeGuid });
        }
    }

    skipBusinessType = () => {
        this.setState({ IsBusinessTypeSkip: true });
        this.getExistingDetails();
        this.setState({ showGeneralDetails: true, showBusinessType: false });
    }

    MovetoDocUpload = () => {
        this.getExistingDetails();
        this.setState({ showEnterpriseDetails: true, showBusinessType: false, IsBusinessTypeSkip: true });
    }

    SupplierSignUpNextPage = (Data) => {
        this.loadData();
        if (Data.isCreated === "true") {
            let formData = {
                'emailId': Data.registerDetails[0].emailId,
                'YourName': Data.registerDetails[0].firstName,
                'companyName': Data.registerDetails[0].companyName,
                'ERPId': Data.registerDetails[0].erpSupplierId,
                'userCountryId': Data.registerDetails[0].countryGuid,
                'Mobile': Data.registerDetails[0].mobileNumber,
                'CompanyRegistrationnumber': Data.registerDetails[0].companyRegistrationNumber,
                'IsOTPSent': false,
                'isCreated': true,
                'UserGuid': Data.registerDetails[0].userGuid,
                'Pancard': Data.registerDetails[0].Pancard
            };

            this.setState({
                showSignUpPage: false, showBusinessType: true,
                businessTypeName: Data.registerDetails[0].businessTypeName,
                BusinessTypeGuid: Data.registerDetails[0].businessTypeGuid,
                GeneralDetails: formData,
                isCreated: true,
                UserGuid: Data.registerDetails[0].userGuid
            });
        } else {
            let formData = {
                'emailId': Data.SignUpEmail
            };
            this.setState({
                showSignUpPage: false, showBusinessType: true,
                GeneralDetails: formData
            });
        }

    }

    GeneralDetailsPreviousPage = () => {
        this.setState({ showGeneralDetails: false, showBusinessType: true, MobileNumber: "", confirmationResult: null, businessTypeName: "" });
    }

    GeneralDetailsNextPage = async (Data) => {
        let IsEditDetails = this.state.IsEditDetails;
        this.setState({ loading: true });
        if(Data.IsOTPSent && Data.IsOTPVarified){
            this.state.GeneralDetails["Mobile"] = Data.Mobile;
        }
        if (localStorage.userStatus !== undefined && localStorage.userStatus !== "null") {
            if (localStorage.userStatus === "Documents Submitted" || localStorage.userStatus === "Response Received" || localStorage.userStatus === "Account Approval Pending" || localStorage.userStatus === "Response Received for Approval" || localStorage.userStatus === "Account Approved") {
                IsEditDetails = false;
                this.setState({ IsEditDetails: false });
            }
        }
            if (IsEditDetails) {
                if (Data !== undefined && Data !== null) {
                    const formData = {};
                    formData['FirstName'] = Data.YourName;
                    formData['UserGuid'] = this.state.UserGuid;
                    formData['EmailId'] = Data.emailId;
                    formData['CompanyName'] = Data.companyName;
                    formData['UserCountryId'] = Data.userCountryId;
                    formData['ErpsupplierId'] = Data.ERPId;
                    formData['UserPhoneNo'] = Data.Mobile;
                    formData['CompanyPhoneNo'] = Data.Mobile;
                    formData['Pancard'] = Data.Pancard;
                    var config = {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.tokenId,
                            'Content-Type': 'application/json',
                            BusinessTypeGuid: this.state.BusinessTypeGuid,
                            CompanyRegistrationNumber: Data.CompanyRegistrationnumber,
                            "ProductTypes": Data.ProductTypes
                        },
                    };
    
                    await axios.post(getServiceUrl() + 'Users/EditProfileUpdate?', formData, config)
                        .then((response) => {
                            
                            if (response.data.saveresult === "success") {
                                this.setState({ showGeneralDetails: false, showEnterpriseDetails: true,loading: false });
    
                                // var configIntegration = {
                                //     headers: {
                                //         "Authorization": "Bearer " + localStorage.tokenId,
                                //         'Content-Type': 'application/json',                                
                                //         'companyguid': Data.companyguid                              
                                //     },
                                // };
    
                                // axios.post(getServiceUrl() + 'Integration/SaveSupplier?', configIntegration)
                                // .then((response) => {
    
    
                                // });
    
                            }
                            else {
                                this.setState({ showGeneralDetails: true,loading: false });
                                toaster.notify(toasterAlert('WARNING', response.data.saveresult), {
                                    duration: null
                                }
                                )
                            }
                        }).catch(err => {
                            this.setState({ loading: false });
                        });
                }
            } else {
                this.setState({ showGeneralDetails: false, showEnterpriseDetails: true,loading: false });
            }
    }

    VerifyMailNextPage = () => {
        this.setState({ showVerifyEmail: false, showCongratsSupplier: true });
    }

    CongratsSupplierHomePage = () => {
        this.context.router.history.push('/');
    }

    onCompleteProfilePage = () => {
        const formData = {};
        let password = this.state.PasswordDetails.password;
        formData['EmailId'] = this.state.UserEmailID;
        formData['Password'] = this.state.PasswordDetails.password;
        this.props.onAuth(formData, this.props);
        // this.context.router.history.push('/');
    }

    EnterPriseDetailsPreviousPage = () => {
        this.setState({ showGeneralDetails: true, showEnterpriseDetails: false });
    }

    EnterPriseDetailsNextPage = () => {
        this.setState({ showFacilityDetails: true, showEnterpriseDetails: false });
    }

    FacilityDetailsPreviousPage = () => {
        this.setState({ showFacilityDetails: false, showEnterpriseDetails: true });
    }

    FacilityDetailsNextPage = () => {
        this.setState({ showFacilityDetails: false, showSustainabilityDetails: true });
    }

    SustainabilityDetailsPreviousPage = () => {
        this.setState({ showFacilityDetails: true, showSustainabilityDetails: false });
    }

    SustainabilityDetailsNextPage = () => {
        this.setState({ showBusinessType: true, showSustainabilityDetails: false });
    }

    render() {

        if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            if (
                localStorage.getItem("IsAuthentic") === "true" ||
                localStorage.getItem("IsAuthentic") === true
            ) {

            } else {
                return <Redirect to="/" />;
            }
        } else {
            return <Redirect to="/home" />;
        }

        const { resources } = this.state;

        return (
            <div className=" signUpOnboarding">
                {this.state.showBusinessType ?
                    <div className="form_components">
                        <div className="form_left">
                            <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                                <div className="">
                                    <h4>{getLabelText(resources.filter((x) => { return x.resourceKey === 'EditProfileinfo1' })[0], "EDIT YOUR PROFILE")}</h4>
                                    <p>{getLabelText(resources.filter((x) => { return x.resourceKey === 'EditProfileinfo2' })[0], "Select Your Partner Type")}</p>
                                </div>
                                <div className="signup_type">
                                    <div className="main_img">
                                        {/* <img src={InfinityImg} /> */}
                                        <div className="form_actions">
                                            <Button className="prev" orangeSubmit onClick={this.skipBusinessType} >
                                                {getLabelText(resources.filter((x) => { return x.resourceKey === 'skipbutton' })[0], "SKIP this Step")}
                                            </Button>
                                            <Button className="prev" blackBtnSimple onClick={this.MovetoDocUpload} >
                                                {getLabelText(resources.filter((x) => { return x.resourceKey === 'MovetoDocUploadbutton' })[0], "Document Upload")}
                                            </Button>
                                        </div>
                                        <div className="subImg">
                                            {this.state.contentState.map((data, i) => {
                                                return (
                                                    <div className={data.isActive ? 'isActive' : 'isNonActive'}>
                                                        {data.isActive ?
                                                            this.state.SelectedbusinessTypeName === data.businessTypeName ?
                                                                <div className='selected' onClick={(event) => this.OpenStagePage(event, data.businessTypeName, data.businessTypeGuid)}>
                                                                    {/* <Tooltip id="businessTypeNames" title={data.businessTypeName}> */}
                                                                    <img src={getAWSUrl() + "SupplierOnBoarding/Icons/" + data.image} />
                                                                    <span>{data.businessTypeName}</span>
                                                                    {/* </Tooltip> */}
                                                                </div> : <div onClick={(event) => this.OpenStagePage(event, data.businessTypeName, data.businessTypeGuid)}>
                                                                    {/* <Tooltip id="businessTypeNames" title={data.businessTypeName}> */}
                                                                    <img src={getAWSUrl() + "SupplierOnBoarding/Icons/" + data.image} />
                                                                    <span>{data.businessTypeName}</span>
                                                                    {/* </Tooltip> */}
                                                                </div> :
                                                            this.state.SelectedbusinessTypeName === data.businessTypeName ?
                                                                <div className='selected'>
                                                                    {/* <Tooltip id="businessTypeNames" title={data.businessTypeName}> */}
                                                                    <img src={getAWSUrl() + "SupplierOnBoarding/Icons/" + data.image} />
                                                                    <span>{data.businessTypeName}</span>
                                                                    {/* </Tooltip> */}
                                                                </div> : <div>
                                                                    {/* <Tooltip id="businessTypeNames" title={data.businessTypeName}> */}
                                                                    <img src={getAWSUrl() + "SupplierOnBoarding/Icons/" + data.image} />
                                                                    <span>{data.businessTypeName}</span>
                                                                    {/* </Tooltip> */}
                                                                </div>
                                                        }
                                                    </div>
                                                )
                                            })}

                                            {/* <div className="isNonActive">
                            <h6>Logistics Partner</h6>
                            <img src={LogisticPartnerImg} />
                        </div>*/}
                                        </div>
                                    </div>
                                    {/* <div className="bottom_icons">
                                <img src={Bottom1} />
                                <img src={Bottom2} />
                                <img src={Bottom3} />
                            </div> */}

                                </div>
                            </div>
                            <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                                <div className="form_components">
                                    <Spinner />
                                </div>
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
                    : ""
                }

                {this.state.showGeneralDetails ?
                    <div className="form_components genDetails_form_right">
                        <div className="form_left">
                            <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                                <GeneralDetails getDetails={this.state.GeneralDetails} onNextPage={this.GeneralDetailsNextPage} onPreviousPage={this.GeneralDetailsPreviousPage} IsEditProfile={true} />
                            </div>
                            <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                                <div className="form_components">
                                    <Spinner />
                                </div>
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
                    </div> : ""}
                {this.state.showOTP ?
                    <div className="form_components genDetails_form_right">
                        <div className="form_left"><OTP selectedCountryCode={this.state.selectedCountryCode} MobileNumber={this.state.MobileNumber} confirmationResult={this.state.confirmationResult} onPreviousPage={this.OTPPreviousPage} onNextPage={this.OTPNextPage} /></div>
                        <div className="form_right">
                            <div>
                                <img src={formRightIcon1} />
                            </div>
                            <div>
                                <p>Zero Carbon Economy is now a <span className="">business priority</span></p>
                            </div>
                        </div>
                    </div> : ""}
                {/* {this.state.showSetPassword ?
                    <div className="form_components">
                        <CreatePassword onPreviousPage={this.SetPasswordPreviousPage} onNextPage={this.SetPasswordNextPage} />
                    </div> : ""} */}

                {this.state.showEnterpriseDetails ?
                    <div className="form_components create_password">
                        <div className="form_left">
                            <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                                <EnterPriseDetails SupplierGuid={localStorage.userId} CompanyName={this.state.companyName} onPreviousPage={this.EnterPriseDetailsPreviousPage} onNextPage={this.EnterPriseDetailsNextPage} />
                            </div>
                            <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                                <div className="form_components">
                                    <Spinner />
                                </div>
                            </div>
                        </div>
                        <div className="form_right">
                            <div>
                                <img src={formRightIcon1} />
                            </div>
                            <div>
                                <p><span>79%</span> Consumers prefer <span>environment conscious</span> brands</p>
                            </div>
                        </div>
                    </div> : ""}

                {this.state.showFacilityDetails ?
                    <div className="form_components create_password">
                        <div className="form_left">
                            <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                                <FacilityDetails SupplierGuid={localStorage.userId} CompanyName={this.state.companyName} onPreviousPage={this.FacilityDetailsPreviousPage} onNextPage={this.FacilityDetailsNextPage} />
                            </div>
                            <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                                <div className="form_components">
                                    <Spinner />
                                </div>
                            </div>
                        </div>
                        <div className="form_right">
                            <div>
                                <img src={formRightIcon1} />
                            </div>
                            <div>
                                <p><span>79%</span> Consumers prefer <span>environment conscious</span> brands</p>
                            </div>
                        </div>
                    </div> : ""}

                {this.state.showSustainabilityDetails ?
                    <div className="form_components create_password">
                        <div className="form_left">
                            <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                                <SustainabilityDocuments SupplierGuid={localStorage.userId} CompanyName={this.state.companyName} onPreviousPage={this.SustainabilityDetailsPreviousPage} onNextPage={this.SustainabilityDetailsNextPage} />
                            </div>
                            <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                                <div className="form_components">
                                    <Spinner />
                                </div>
                            </div>
                        </div>
                        <div className="form_right">
                            <div>
                                <img src={formRightIcon1} />
                            </div>
                            <div>
                                <p><span>79%</span> Consumers prefer <span>environment conscious</span> brands</p>
                            </div>
                        </div>
                    </div> : ""}
            </div>
        )
    }

}


export default EditProfile;