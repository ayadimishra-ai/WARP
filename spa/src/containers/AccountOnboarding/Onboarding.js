import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import StepConnector from "@material-ui/core/StepConnector";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";
import withStyles from "@material-ui/core/styles/withStyles";
import axios from 'axios';
import queryString from "query-string";
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import { Redirect } from "react-router-dom";
import onboardingSuccess from '../../assets/img/Signuponboarding/onboardingSuccess.png';
import BasicInfo from "../../components/AccountOnboarding/BasicInfo";
import FacilityInfo from "../../components/AccountOnboarding/FacilityInfo";
import ProductInfo from "../../components/AccountOnboarding/ProductInfo";
import { getServiceUrl, getUserPermision } from '../../config';
import * as PageKeys from "../../pagekeys";
import { popupAlert } from "../../UI/Popups/popup";
import * as RoleCodes from "../../rolecodes";
import Button from "../../components/Material/CustomButtons/Button";
import { BreadCrumb } from "../../utility";
import Spinner from "../../UI/Spinner/Spinner";
import OrganisationStructure from "../../components/AccountOnboarding/OrganisationStructure";


const styles = (theme) => ({
    step: {
        "& $completed": {
            zIndex: "99",
            color: "#fff",
            fontSize: "16px",
        },
        "& $active": {
            zIndex: '99',
            color: "#72D0C6",
            fontSize: '16px',
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
        fontSize: '12px',
        fontWeight: '600',
        lineHeight: '15px',
        color: '#fff !important',
        whiteSpace: 'nowrap',
        top: '8px',
        left: 'calc(-50% + -15px)',
        right: 'calc(50% + 20px)',
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


class AccountOnboarding extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeStep: JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ? 1 : 2,
            GeneralDetails: null,
            EnterpriseDetails: null,
            ProductInfoDetails: [],
            TargetRegionDetails: [],
            facilityAddressList: [],
            DocumentsDetail: [],
            CommentLogDetails: [],
            onBoardingData: [],
            CommentLog: [],
            userType: null,
            loading: false,
            commentError: '',
            documentComment: null,
            //completed: { 0: true, 1: false, 2: false, 3: false, 4: false, 5: false },
            completed: [{ 0: true , 1: false , 2: false } ],
            documentsPending: "",
            srmEdit: true,
        }
    }

    handleDocumentPending = (documentsPendingData) => {
        this.setState({ documentsPending: documentsPendingData })
        
    }
    handleNext = async (StepName) => {
        switch (StepName) {
            case "Company":
                this.setState(state => ({
                    activeStep: state.activeStep + 1,
                    //TargetRegionDetails: Data,
                }));
                break;
            case "Product":
                this.setState(state => ({
                    activeStep: state.activeStep + 1,
                    //EnterpriseDetails: Data,
                }));
                break;
            case "Facilities":
                if (this.state.userType === RoleCodes.BUYER) {
                    this.setState(state => ({
                        activeStep: state.activeStep + 2,
                        //GeneralDetails: Data
                    }));
                }
                else if (this.state.userType === RoleCodes.ORGANIZATIONADMIN) {
                    this.setState(state => ({
                        activeStep: state.activeStep + 2,
                        //GeneralDetails: Data
                    }));
                }
                else {
                    this.setState(state => ({
                        activeStep: state.activeStep + 1,
                        //GeneralDetails: Data
                    }));
                }
                break;
            default:
                this.setState(state => ({ activeStep: state.activeStep + 1 }));
                break;
        }
        // switch (StepName) {
        //     case "Basic Info":
        //         this.setState(state => ({
        //             activeStep: state.activeStep + 1,
        //             GeneralDetails: Data
        //         }));
        //         break;
        //     case "Enterprise Info":
        //         this.setState(state => ({
        //             activeStep: state.activeStep + 1,
        //             GeneralDetails: Data
        //         }));
        //         break;
        //     case "Product Info":
        //         this.setState(state => ({
        //             activeStep: state.activeStep + 1,
        //             EnterpriseDetails: Data,
        //         }));
        //         break;
        //     case "Target Market":
        //         this.setState(state => ({
        //             activeStep: state.activeStep + 1,
        //             ProductInfoDetails: Data,
        //         }));
        //         break;
        //     case "Facilities":
        //         this.setState(state => ({
        //             activeStep: state.activeStep + 1,
        //             TargetRegionDetails: Data,
        //         }));
        //         break;
        //     case "Documents":
        //         let array1 = [];
        //         array1 = Data.map(item => {
        //             let detail = {
        //                 address: item.AddressLine1,
        //                 countryguid: item.CountryGuid,
        //                 stateguid: item.StateGuid,
        //                 city: item.City,
        //                 zipcode: item.ZipCode,
        //                 landMark: item.LandMark,
        //                 addressTypeGuid: item.AddressTypeGuid,
        //                 addressTitle: item.AddressTitle,
        //                 addressGuid: item.addressGuid,
        //                 countryName: item.CountryName,
        //                 stateName: item.StateName,
        //                 createdDate: item.createdDate,
        //             }
        //             return detail;
        //         });
        //         this.setState(state => ({
        //             activeStep: state.activeStep + 1,
        //             facilityAddressList: array1,
        //         }));
        //         break;
        //     default:
        //         this.setState(state => ({ activeStep: state.activeStep + 1 }));
        //         // this.setState({ loading: true });
        //         // let IsValid = true;
        //         // let GeneralDetails = this.state.GeneralDetails;
        //         // let EnterpriseDetails = this.state.EnterpriseDetails;
        //         // let ProductInfoDetails = this.state.ProductInfoDetails;
        //         // let TargetRegionDetails = this.state.TargetRegionDetails;

        //         // let facilityAddressListData = [];
        //         // if (this.state.facilityAddressList.length > 0) {
        //         //     facilityAddressListData = this.state.facilityAddressList.map(item => {
        //         //         let detail = {
        //         //             AddressLine1: item.address,
        //         //             CountryGuid: item.countryguid,
        //         //             StateGuid: item.stateguid,
        //         //             City: item.city,
        //         //             ZipCode: item.zipcode,
        //         //             LandMark: item.landMark,
        //         //             AddressTypeGuid: item.addressTypeGuid,
        //         //             AddressTitle: item.addressTitle,
        //         //             addressGuid: item.addressGuid,
        //         //             CountryName: item.countryName,
        //         //             StateName: item.stateName,
        //         //             createdDate: item.createdDate,
        //         //         }
        //         //         return detail;
        //         //     });
        //         // }
        //         // else {
        //         //     facilityAddressListData = this.state.facilityAddressList;
        //         // }

        //         // let DocumentsDetail = Data.DocumentsDetail;
        //         // let Comments = "";
        //         // let commentLog = this.state.CommentLog;
        //         // if (Data.Comment != "") {
        //         //     let tempComment = {
        //         //         firstName: "",
        //         //         comment: Data.Comment,
        //         //         createdBy: "",
        //         //         createdDate: "",
        //         //         companyStatusLogGuid: null
        //         //     }
        //         //     commentLog.push(tempComment);
        //         // }

        //         // if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
        //         //     if (commentLog.length == 0) {
        //         //         IsValid = false;
        //         //         this.setState({loading: false,commentError:'Comments field is blank. Please enter detail in comments.'})

        //         //     }
        //         // }
        //         // if (IsValid) {
        //         //     const { companyName = "", YourName = "", userCountryId = "",
        //         //         emailId = "", Mobile = "",
        //         //         UserGuid, status, IsEditProfile, RoleName, partnerType } = this.state.GeneralDetails;

        //         //     let ncompanyName = typeof companyName === 'string' ? companyName : companyName.value;
        //         //     let nYourName = typeof YourName === 'string' ? YourName : YourName.value;
        //         //     let nemailId = typeof emailId === 'string' ? emailId : emailId.value;
        //         //     let nMobile = typeof Mobile === 'string' ? Mobile : Mobile.value;
        //         //     let npartnerType = typeof partnerType === 'string' ? partnerType : partnerType.value;
        //         //     let nuserCountryId = typeof userCountryId === 'string' ? userCountryId : userCountryId.value;

        //         //     let companyGuid = "", Rolename = "", QueryUserGuid = "00000000-0000-0000-0000-000000000000";
        //         //     if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
        //         //         let params = queryString.parse(this.props.location.search);
        //         //         companyGuid = params.Companyguid;
        //         //         Rolename = params.Rolename;
        //         //         QueryUserGuid = params.UserGuid;
        //         //     }
        //         //     else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
        //         //         companyGuid = localStorage.companyGuid;
        //         //         Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
        //         //         QueryUserGuid = localStorage.userId;
        //         //     }

        //         //     var body = {
        //         //         'UserGuid': QueryUserGuid,
        //         //         'CompanyName': ncompanyName,
        //         //         'CountryGuid': nuserCountryId,
        //         //         'FirstName': nYourName,
        //         //         'EmailId': nemailId,
        //         //         'MobileNumber': nMobile,
        //         //         'BusinessTypeGuid': npartnerType,
        //         //         'CompanyWebsite': this.state.EnterpriseDetails.WebsiteURL.value,
        //         //         'CompanyGuid': companyGuid,
        //         //         'YearEstablished': this.state.EnterpriseDetails.EstablishedIn.value != "" ? this.state.EnterpriseDetails.EstablishedIn.value : 0,
        //         //         'GstNumber': this.state.EnterpriseDetails.GST.value,
        //         //         'CompanyRegistrationNumber': this.state.EnterpriseDetails.CINCRN.value,
        //         //         'PANCardNumber': this.state.EnterpriseDetails.PAN.value,
        //         //         'LegalStructureGuid': this.state.EnterpriseDetails.LegalStructure.value != 0 ? this.state.EnterpriseDetails.LegalStructure.value : "00000000-0000-0000-0000-000000000000",
        //         //         'RoleName': Rolename,
        //         //         'Companydocs': DocumentsDetail,
        //         //         'Address': facilityAddressListData,
        //         //         'Comodity': ProductInfoDetails,
        //         //         'TargetMarket': TargetRegionDetails,
        //         //         'Comments': commentLog,
        //         //         'SrmGuid': localStorage.userId,
        //         //     };
        //         //     var config = {
        //         //         headers: {
        //         //             'Authorization': 'Bearer ' + localStorage.tokenId,
        //         //             'Content-Type': 'application/json'
        //         //         },
        //         //     };
        //         //     await axios.post(getServiceUrl() + 'Onboarding/UpdateAccountDetails?', body, config)
        //         //         .then((response) => {
        //         //             console.log(response);
        //         //             if (response.status === 200) {
        //         //                 this.setState({ loading: false });
        //         //                 this.setState(state => ({ activeStep: state.activeStep + 1 }));
        //         //             }
        //         //         }).catch((err) => {
        //         //             console.log(err);
        //         //             popupAlert('error', 'Error', 'Something went wrong. Please try again.')
        //         //         });
        //         // }
        //         break;
        // }
    };

    handleBack = (StepName) => {
        switch (StepName) {
            case "Company":
                if (this.state.userType === RoleCodes.BUYER || this.state.userType === RoleCodes.ORGANIZATIONADMIN) {
                    this.setState(state => ({
                        activeStep: state.activeStep - 2,
                        //facilityAddressList: CurrentData.facilityAddressList,
                        //DocumentsDetail: CurrentData.DocumentsDetail,
                        //documentComment: CurrentData.Comment,
                    }));
                }
                else {
                    this.setState(state => ({
                        activeStep: state.activeStep - 1,
                    }));
                }
                break;
            case "Product":
                this.setState(state => ({
                    activeStep: state.activeStep - 1,
                    //ProductInfoDetails: CurrentData.ProductInfoDetails,
                    //TargetRegionDetails: CurrentData.TargetRegionData,
                }));
                break;
            case "Facilities":
                this.setState(state => ({
                    activeStep: state.activeStep - 1,
                    //EnterpriseDetails: CurrentData,
                    //GeneralDetails: PrevData !== null ? PrevData : this.state.GeneralDetails
                }));
                break;
            default:
                break;
        }
        // switch (StepName) {
        //     case "Basic Info":
        //         this.setState(state => ({
        //             activeStep: state.activeStep - 1,
        //             EnterpriseDetails: CurrentData,
        //             GeneralDetails: PrevData !== null ? PrevData : this.state.GeneralDetails
        //         }));
        //         break;
        //     case "Enterprise Info":
        //         this.setState(state => ({
        //             activeStep: state.activeStep - 1,
        //             EnterpriseDetails: CurrentData.EnterpriseDetails,
        //             ProductInfoDetails: CurrentData.ProductInfoDetails,
        //         }));
        //         break;
        //     case "Product Info":
        //         this.setState(state => ({
        //             activeStep: state.activeStep - 1,
        //             ProductInfoDetails: CurrentData.ProductInfoDetails,
        //             TargetRegionDetails: CurrentData.TargetRegionData,
        //         }));
        //         break;
        //     case "Target Market":
        //         let array2 = [];
        //         array2 = CurrentData.facilityAddressList.map(item => {
        //             let detail = {
        //                 address: item.AddressLine1,
        //                 countryguid: item.CountryGuid,
        //                 stateguid: item.StateGuid,
        //                 city: item.City,
        //                 zipcode: item.ZipCode,
        //                 landMark: item.LandMark,
        //                 addressTypeGuid: item.AddressTypeGuid,
        //                 addressTitle: item.AddressTitle,
        //                 addressGuid: item.addressGuid,
        //                 countryName: item.CountryName,
        //                 stateName: item.StateName,
        //                 createdDate: item.createdDate,
        //             }
        //             return detail;
        //         });
        //         this.setState(state => ({
        //             activeStep: state.activeStep - 1,
        //             TargetRegionDetails: CurrentData.TargetRegionData,
        //             facilityAddressList: array2
        //         }));
        //         break;
        //     case "Facilities":
        //         this.setState(state => ({
        //             activeStep: state.activeStep - 1,
        //             facilityAddressList: CurrentData.facilityAddressList,
        //             DocumentsDetail: CurrentData.DocumentsDetail,
        //             documentComment: CurrentData.Comment,
        //         }));
        //         break;
        //     case "Documents":
        //         this.setState(state => ({
        //             activeStep: state.activeStep - 1
        //         }));
        //         break;
        //     default:
        //         break;
        // }
    };
    handleBackComplete = (CurrentData, StepName) => {
        const { completed } = this.state;
        if (this.state.activeStep === 1) {
            if (CurrentData.length > 0) {
                
                if (CurrentData.ProductInfoDetails.length > 0) {
                    completed[1] = true;
                    //this.setState({
                    //    completed: {
                    //        1: true,
                    //    }
                    //});
                }
            }
            else {
                if (CurrentData.ProductInfoDetails.length > 0) {
                    completed[1] = true;

                }
                else {
                    completed[1] = false;}
            }
        }

        if (this.state.activeStep === 2) {
            if (CurrentData != null && CurrentData != undefined) {
                if (CurrentData.facilityAddressList != null && CurrentData.facilityAddressList != undefined) {
                    completed[2] = true;
                }
            }
        }

        //if (this.state.activeStep === 2) {
        //    if (CurrentData.length > 0) {
        //        if (CurrentData.facilityAddressList.length > 0) {
        //            completed[2] = true;
        //            //this.setState({
        //             //   completed: {
        //              //      2: true,
        //              //  }
        //            //});
        //        }  
        //    }
        // }

        // else if (this.state.activeStep === 2) {
        //     if (CurrentData.ProductInfoDetails.length > 0) {
        //         completed[this.state.activeStep] = true;
        //         this.setState({
        //             completed,
        //         });
        //     }
        // }

        // if (this.state.activeStep === 1) {
        //     if (CurrentData.GST.value !== "") {
        //         completed[this.state.activeStep] = true;
        //         this.setState({
        //             completed,
        //         });
        //     }
        // }
        // else if (this.state.activeStep === 2) {
        //     if (CurrentData.ProductInfoDetails.length > 0) {
        //         completed[this.state.activeStep] = true;
        //         this.setState({
        //             completed,
        //         });
        //     }
        // }
        // else if (this.state.activeStep === 3) {
        //     if (CurrentData.TargetRegionData.length > 0) {
        //         completed[this.state.activeStep] = true;
        //         this.setState({
        //             completed,
        //         });
        //     }
        // }
        // else if (this.state.activeStep === 4) {
        //     if (CurrentData.facilityAddressList.length > 0) {
        //         completed[this.state.activeStep] = true;
        //         this.setState({
        //             completed,
        //         });
        //     }
        // }
        // else if (this.state.activeStep === 5) {
        //     if (CurrentData.DocumentsDetail.length > 0) {
        //         completed[this.state.activeStep] = true;
        //         this.setState({
        //             completed,
        //         });
        //     }
        // }
        this.handleBack(StepName);
    };

    handleComplete = (CurrentData, StepName) => {
        
        const { completed } = this.state;
        if (this.state.activeStep === 1) {
            if (CurrentData.ProductInfoDetails.length > 0) {
                completed[1] = true;
                //this.setState({
                //    completed: {
                //        1: true,
                //    }
                //});
            }
        }
        if (this.state.activeStep === 2) {
            if (CurrentData.facilityAddressList.length > 0) {
                completed[2] = true;
                //this.setState({
                //    completed: {
                //        2: true,
                //    }
              //  });
            }
        }
        if (this.state.activeStep === 0) {
            if (CurrentData.GeneralDetails !== null) {
                completed[0] = true;
                //this.setState({
                 //   completed: {
                  //      0: true,
                   // }
               // });
            }
        }

        // if (this.state.activeStep === 1) {
        //     if (Data.GST.value !== "") {
        //         completed[this.state.activeStep] = true;
        //         this.setState({
        //             completed,
        //         });
        //     }
        // }
        // else if (this.state.activeStep === 2) {
        //     if (Data.length > 0) {
        //         completed[this.state.activeStep] = true;
        //         this.setState({
        //             completed,
        //         });
        //     }
        // }
        // else if (this.state.activeStep === 3) {
        //     if (Data.length > 0) {
        //         completed[this.state.activeStep] = true;
        //         this.setState({
        //             completed,
        //         });
        //     }
        // }
        // else if (this.state.activeStep === 4) {
        //     if (Data.length > 0) {
        //         completed[this.state.activeStep] = true;
        //         this.setState({
        //             completed,
        //         });
        //     }
        // }
        // else if (this.state.activeStep === 5) {
        //     if (Data.length > 0) {
        //         completed[this.state.activeStep] = true;
        //         this.setState({
        //             completed,
        //         });
        //     }
        // }
        this.handleNext(StepName);
    };

    handleReset = () => {
        this.setState({
            activeStep: 0,
        });
    };
    handleStep = step => () => {

        if (this.state.userType === RoleCodes.BUYER || this.state.userType === RoleCodes.ORGANIZATIONADMIN) {
            if (step === 1) {
                this.setState({
                    activeStep: 2
                });
            }
            else {
                this.setState({
                    activeStep: step
                });
            }
        }
        else if (this.state.userType === RoleCodes.ORGANIZATIONADMIN) {
            if (step === 1) {
                this.setState({
                    activeStep: 2
                });
            }
            else if (step === 2) {
                this.setState({
                    activeStep: 4
                });
            }
            else {
                this.setState({
                    activeStep: step
                });
            }
        }
        else {
            this.setState({
                activeStep: step
            });
        }

    };
    getSteps = () => {
        if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
            return ['Company', 'Facilities'];
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            return ['Company', 'Product', 'Facilities'];
        } else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            let params = queryString.parse(this.props.location.search);
            if (params.Rolename.toUpperCase() === RoleCodes.BUYER) {
                return ['Company', 'Facilities'];
            }
            if (params.Rolename.toUpperCase() === RoleCodes.SUPPLIER) {
                return ['Company', 'Product', 'Facilities'];
            }
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) {
            return ['Company', 'Facilities'];
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) {
            return ['Company', 'Facilities'];
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) {
            return ['Company', 'Facilities', 'Organization Hierarchy'];
        }

        //return ['Basic Info', 'Enterprise Info', 'Product Info', 'Target Market', 'Facilities', 'Documents'];
    }
    getStepContent = (step) => {
        switch (step) {
            case 0:
                return <BasicInfo stepNext={(Data, StepName) => this.handleComplete(Data, StepName)}
                //getDetails={this.state.GeneralDetails}
                //getCommentLogDetail={this.state.CommentLogDetails}
                //getDocumentsDetailData={this.state.DocumentsDetail}
                />;
            // case 1:
            //     return <EnterpriseInfo stepNext={(Data, StepName) => this.handleComplete(Data, StepName)}
            //         stepBack={(PrevData, CurrentData, StepName) => this.handleBackComplete(PrevData, CurrentData, StepName)}
            //         GetEnterpriseDetails={this.state.EnterpriseDetails}
            //         getDetails={this.state.GeneralDetails}
            //         getCommentLogDetail={this.state.CommentLogDetails} />;
            case 1:
                return <ProductInfo stepNext={(Data, StepName) => this.handleComplete(Data, StepName)}
                    stepBack={(CurrentData, StepName) => this.handleBackComplete(CurrentData, StepName)}
                // GetProductInfoDetails={this.state.ProductInfoDetails}
                // GetEnterpriseDetails={this.state.EnterpriseDetails}
                // companyName={this.state.GeneralDetails.companyName}
                //getCommentLogDetail={this.state.CommentLogDetails} 
                    getDocumentPending={this.handleDocumentPending}
                />;
            // case 3:
            //     return <TargetMarket stepNext={(Data, StepName) => this.handleComplete(Data, StepName)}
            //         stepBack={(PrevData, CurrentData, StepName) => this.handleBackComplete(PrevData, CurrentData, StepName)}
            //         GetTargetRegionDetails={this.state.TargetRegionDetails}
            //         GetProductInfoDetails={this.state.ProductInfoDetails}
            //         getCommentLogDetail={this.state.CommentLogDetails} />;
            case 2:
                return <FacilityInfo stepNext={(Data, StepName) => this.handleComplete(Data, StepName)}
                    stepBack={(CurrentData, StepName) => this.handleBackComplete(CurrentData, StepName)}
                // GetFacilityAddressList={this.state.facilityAddressList}
                // GetTargetRegionDetails={this.state.TargetRegionDetails}
                //getCommentLogDetail={this.state.CommentLogDetails} 
                    getDocumentPending={this.handleDocumentPending}
                />;
            // case 5:
            //     return <DocumentInfo stepNext={(Data, StepName) => this.handleComplete(Data, StepName)}
            //         stepBack={(PrevData, CurrentData, StepName) => this.handleBackComplete(PrevData, CurrentData, StepName)}
            //         getDetails={this.state.GeneralDetails}
            //         GetFacilityAddressList={this.state.facilityAddressList}
            //         getCommentLogDetail={this.state.CommentLogDetails}
            //         commentError={this.state.commentError}
            //         getDocumentComment={this.state.documentComment} />;
            case 3:
                return <React.Fragment><div className="subTitle_header onboarding_congrats">
                    <p>
                        Thanks for submitting your details. <br /><br />
                        {/* Your profile is pending for approval! We will keep you updated. */}
                    </p>
                    {/* <div>
                        <span>Your application details are:</span>
                        <h5><b>Application ID</b><br /> ####### </h5>
                    </div> */}
                    <div>
                        {/* <h5><b>Assigned to:</b><br /> Mahesh Jha<br /> Sustainable Supply Chain Network Expert</h5> */}
                    </div>
                    <div>
                        <Button onClick={this.redirectToDashboard} className="solid_btn_new">Dashboard</Button>
                    </div>
                </div><div><img src={onboardingSuccess} /></div></React.Fragment>;
            case 4:
                return <OrganisationStructure />
            default:
        }
    }
    redirectToDashboard() {
        window.location.href = "/home";
        localStorage.removeItem("SelectedUserCountryCode");
    }
    async getdocumentdetails() {
       // await this.getGetAccountDetails();
        this.getExistingDetails();
        this.setState({ documentsPending: '', })
        if (this.state.activeStep ===1) {
           // this.setState({completed:1})
        }
        localStorage.setItem('DocumentInfoPending','')
    }

    async componentDidMount() {
        // {console.log(this.props.location.search)}
        // {console.log("AABB",localStorage.srmEdit)}

        if( JSON.stringify(localStorage.srmEdit) === '"true"')
                {
                    this.setState({srmEdit: true });
                }
                else
                {
                    this.setState({srmEdit:false });
                }
        //await this.getGetAccountDetails();

        if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
            this.setState({ activeStep: 2, userType: JSON.parse(localStorage.userType) });
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            this.setState({ userType: JSON.parse(localStorage.userType) });
        } else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            let params = queryString.parse(this.props.location.search);
            if (params.Rolename.toUpperCase() === RoleCodes.BUYER) {
                if (this.state.srmEdit === true) {
                    this.setState({ activeStep: 2, userType: params.Rolename.toUpperCase() });
                }
                else {
                    this.setState({ activeStep: 0, userType: params.Rolename.toUpperCase() });
                }
            }
            if (params.Rolename.toUpperCase() === RoleCodes.SUPPLIER) {
                if (this.state.srmEdit === true) {
                    this.setState({ userType: params.Rolename.toUpperCase() });
                }
                else {
                    this.setState({ activeStep: 0, userType: params.Rolename.toUpperCase() });
                }
            }
            localStorage.setItem("SelectedUserCountryCode", params.UserCompanyGuid);
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) {
            this.setState({ activeStep: 2, userType: JSON.parse(localStorage.userType) });
        }
        else if (JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) {
            this.setState({ activeStep: 2, userType: JSON.parse(localStorage.userType) });
        }
        localStorage.setItem("OnboardingAccountLocation", "");
        //await this.getExistingDetails();
        localStorage.removeItem("srmEdit");
    }

    async getExistingDetails() {
      //  
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                userGuid: localStorage.userId
            },
        };

        await axios.get(getServiceUrl() + 'Users/GetProfileDetails', config)
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
                                'Pancard': response.data.registerDetails[0].panCard,
                                'partnerType': response.data.registerDetails[0].businessTypeGuid
                            };

                            this.setState({ GeneralDetails: formData1, UserGuid: response.data.registerDetails[0].userGuid, companyName: response.data.registerDetails[0].companyName });
                        }
                    }
                }
            }).catch(err => {
                this.setState({ loading: false });
            });



    }
    

    async getGetAccountDetails() {
    const { completed } = this.state;
    let productstep = false, facilitystep = false;
    let Address = [];
    let GeneralDetailsData = {};
    let companyGuid = "", Rolename = "", StatusName = "", UserGuid = "00000000-0000-0000-0000-000000000000";
    if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
        let params = queryString.parse(this.props.location.search);
        companyGuid = params.Companyguid;
        Rolename = params.Rolename;
        StatusName = params.StatusName;
        UserGuid = localStorage.userId;
    }
    else if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIER) {
        companyGuid = localStorage.companyGuid;
        Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
        StatusName = localStorage.userStatus;
        UserGuid = localStorage.userId;
    }
    else if (JSON.parse(localStorage.userType) == RoleCodes.BUYER) {
        companyGuid = localStorage.companyGuid;
        Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
        StatusName = localStorage.userStatus;
        UserGuid = localStorage.userId;
    }
    else if (JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) {
        companyGuid = localStorage.companyGuid;
        Rolename = localStorage.userType !== null ? String(localStorage.userType).indexOf("\"") > -1 ? JSON.parse(localStorage.userType) : localStorage.userType : "";
        StatusName = localStorage.userStatus;
        UserGuid = localStorage.userId;
    }
    var config = {
        headers: {
            'Authorization': 'Bearer ' + localStorage.tokenId,
            'Content-Type': 'application/json',
            CompanyGuid: companyGuid,
            RoleName: Rolename,
            CompanyStatusName: StatusName,
            UserGuid: UserGuid
        },
    };


    var config2 = {
        headers: {
            Authorization: "Bearer " + localStorage.tokenId,
            "Content-Type": "application/json",
            "Userguid": UserGuid,
            "UserType": JSON.parse(localStorage.userType),
            "Companyguid": companyGuid,
            "IsDelete": false
        },
    };

    let body = {
        'Address': Address, 'SrmGuid': localStorage.userId, 'issubmit': false,
        'sendmail': false
    };
    await axios.post(getServiceUrl() + 'Users/AddMultipleAddress', body, config2)
        .then((response) => {
            this.setState({ facilityAddressList: response.data, loading: false });
            if (response.data.length > 0) {

                facilitystep = true;
            }
        }).catch((err) => {
            popupAlert('error', 'Error', 'Something went wrong. Please try again.')
        });



    await axios.get(getServiceUrl() + 'Onboarding/GetAccountDetails', config)
        .then((response) => {
            this.setState({ loading: false });
            if (response.status === 200) {
                if (response.data.table1.length > 0) {
                     GeneralDetailsData = {
                        'companyName': response.data.table1[0].companyName.trim(), 'LegalStructure': response.data.table1[0].legalStructureGuid !== null && response.data.table1[0].legalStructureGuid !== "" ? response.data.table1[0].legalStructureGuid : "",
                        'CINCRN': response.data.table1[0].companyRegistrationNumber !== null && response.data.table1[0].companyRegistrationNumber !== "" ? response.data.table1[0].companyRegistrationNumber : "",
                        'PAN': response.data.table1[0].panCardNumber !== null && response.data.table1[0].panCardNumber !== "" ? response.data.table1[0].panCardNumber : "",
                    };

                    if (response.data.table1[0].gstNumber !== null) {

                    }
                }
                if (response.data.table2.length > 0) {
                    let DocumentsDetailData = {};
                    DocumentsDetailData = response.data.table2;
                    this.setState({ DocumentsDetail: DocumentsDetailData });
                    //this.setState({ completed: { 2: true } });
                }
                if (response.data.table3.length > 0) {
                    let CommentLogData = {};
                    CommentLogData = response.data.table3;
                    this.setState({ CommentLogDetails: CommentLogData });
                    // this.setState({ completed: { 3: true } });
                }
            }

        }).catch(err => {
            this.setState({ loading: false });
        });

    var config3 = {
        headers: {
            "Authorization": "Bearer " + localStorage.tokenId,
            "CompanyName": GeneralDetailsData.companyName,
            "UserGuid": UserGuid,
            "CRNNumber": GeneralDetailsData.CINCRN,
            "PanCardNo": GeneralDetailsData.PAN,
            "RoleName": Rolename
        }
    };

    await axios.get(getServiceUrl() + 'Users/GetCategoryProductTypeDetails', config3)
        .then((response) => {

            if (response.data.status200OK) {
                  let arrayData1 = [];
                let selectedProductTypeText = [];
                let selectedProductTypeValue = [];
                let arrayData = response.data.productTypeDetails.comodityDetails;
                if (arrayData !== null) {
                    arrayData.map((itemCommodity) => {
                        let IsCategorySelected = itemCommodity.categoryDetails.map((itemCategory) => {
                            let IsSubCategorySelected = itemCategory.subCategoryDetails.map((itemSubCategory) => {
                                let ProductTotalCount = itemSubCategory.productTypeDetail.length;
                                let ProductSelectedCount = itemSubCategory.productTypeDetail.filter(x => x.isSelected === true).length;

                                if (itemSubCategory.productTypeDetail.filter(x => x.isSelected === true).length > 0) {
                                    productstep = true;
                                }



                            });

                        });
                    });
                }
            }

        });
    this.setState({
        completed: {
            0: true, 1: productstep, 2: facilitystep
        }
    });


}

    bindCommentLog = (Data) => {
        this.setState({ CommentLog: Data });
    }

        render() {
            let permissions = localStorage.permissions !== undefined? JSON.parse(localStorage.permissions):[];
            let IsPermissionGrantedsupplier = getUserPermision(permissions, PageKeys.supplieronboardingaccount);
            let IsPermissionGrantedbuyer = getUserPermision(permissions, PageKeys.buyeronboardingaccount);
            let IsPermissionGrantedVC = getUserPermision(permissions, PageKeys.vconboardingaccount);
            let IsPermissionGrantedorgAdmin = getUserPermision(permissions, PageKeys.orgadminonboardingaccount);
            let FinalAccessPermission = 0;
            if(permissions.length === 0){
                return <Redirect to="/not-found" />;
            }
            if(IsPermissionGrantedsupplier !== null)
            {
                FinalAccessPermission = FinalAccessPermission + 1;
            }

        if (IsPermissionGrantedbuyer !== null) {
            FinalAccessPermission = FinalAccessPermission + 1;
        }

            if(IsPermissionGrantedVC !== null)
            {
                FinalAccessPermission = FinalAccessPermission + 1;
            }

            if(IsPermissionGrantedVC !== null)
            {
                FinalAccessPermission = FinalAccessPermission + 1;
            }

            if(IsPermissionGrantedorgAdmin !== null)
            {
                FinalAccessPermission = FinalAccessPermission + 1;
            }

        if (FinalAccessPermission === 0) {
            return <Redirect to="/not-found" />;
        }

        const { documentsPending } = this.state;
        if (this.state.documentsPending !== "" && this.state.documentsPending !== undefined && this.state.documentsPending !== "true") {
            this.getdocumentdetails();
        }

        let breadCrumb = null;
        if (JSON.parse(localStorage.userType) == RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            breadCrumb = BreadCrumb([{ 'pageName': 'Home', 'url': '/home' },
            { 'pageName': 'Partner Listing', 'url': '/companylisting' },
            { 'pageName': 'Partner Details', 'url': '/#' },
            ])
        }
        else {
            breadCrumb = BreadCrumb([{ 'pageName': 'Home', 'url': '/home' },
            { 'pageName': 'Account Details', 'url': '/onboarding-account' }
            ])
        }
        const { classes } = this.props;
        // let isBuyer = false;
        // if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
        //     isBuyer = true;
        // } else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
        //     let params = queryString.parse(this.props.location.search);
        //     if (params.Rolename.toUpperCase() === RoleCodes.BUYER) {
        //         isBuyer = true;
        //     }
        // }
        const connector = (
            <StepConnector
                classes={{
                    active: classes.connectorActive,
                    completed: classes.connectorCompleted,
                    // disabled: classes.connectorDisabled,
                    alternativeLabel: classes.connectorCompleted,
                    line: classes.connectorLine
                }}
            />
        );
        const steps = this.getSteps();
        const { activeStep } = this.state;
        let currentStep = this.state.activeStep;
        // let msgForbuyer = null;
        // if (this.state.userType !== RoleCodes.BUYER) {
        //     msgForbuyer = "Complete your company profile";
        // }
        // else {
        //     msgForbuyer = "Company profile";
        // }
        if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
            if (this.state.activeStep === 2) {
                currentStep = 1;
            }
        } else if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIERRELATIONSHIPMANAGER) {
            let params = queryString.parse(this.props.location.search);
            if (params.Rolename.toUpperCase() === RoleCodes.BUYER) {
                if (this.state.activeStep === 2) {
                    currentStep = 1;
                }
                else {
                    currentStep = this.state.activeStep;
                }
            }
        }else if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) {
            if (this.state.activeStep === 2) {
                currentStep = 1;
            }
        }else if (JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) {
            if (this.state.activeStep === 2) {
                currentStep = 1;
            }
        } else if (JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) {
            if (this.state.activeStep === 2) {
                currentStep = 1;
            } else if(this.state.activeStep === 4){
                currentStep = 2;
            }
        }
        return (

            <React.Fragment>
                <div className="breadtitle_wrap steppercontainer">
                    {breadCrumb}
                    <div className="page_top_title">

                    </div>
                </div>
                <div style={{ paddingRight: '0px' }} className=" ">
                    <div className="stepper_container">
                        <div className="page_heading">
                            {/* {this.state.activeStep === 0 && 'Update Profile - Basic Details'} */}
                            {this.state.activeStep === 0 && 'Update Profile - Company Details'}
                            {this.state.activeStep === 1 && this.state.userType === RoleCodes.BUYER && 'Update Profile - Procurement Details'}
                            {this.state.activeStep === 1 && this.state.userType === RoleCodes.SUPPLIER && 'Update Profile - Product Offering'}
                            {/* {this.state.activeStep === 3 && 'Update Profile - Target Market'} */}
                            {this.state.activeStep === 2 && this.state.userType === RoleCodes.BUYER && 'Update Profile - Office & Facility Addresses'}
                            {this.state.activeStep === 2 && this.state.userType === RoleCodes.SUPPLIER && 'Update Profile - Facility Details'}
                            {/* {this.state.activeStep === 5 && 'Update Profile - Supporting Documents'} */}
                            {this.state.activeStep === 3 && 'Hurray, Congratulations!!!'}
                        </div>
                        {/* {!isBuyer && this.state.userType !== RoleCodes.BUYER ? */}
                        {this.state.activeStep === 3 ? '' : <div className="account_onboarding_stepper_div common_stepper_cont">
                            <Stepper nonLinear className="account_onboarding_stepper common_stepper" connector={connector} activeStep={currentStep} alternativeLabel>
                                {steps.map((label, index) => (
                                    <Step
                                        key={label}
                                        classes={{
                                            root: classes.step,
                                            completed: classes.completed,
                                            active: classes.active,
                                            disabled: classes.disabled
                                        }}>
                                        <StepButton completed={this.state.completed[index]} onClick={this.handleStep(index)}>
                                            <StepLabel
                                                classes={{
                                                    alternativeLabel: classes.alternativeLabel,
                                                    labelContainer: classes.labelContainer,
                                                    active: classes.activeLabel,
                                                    completed: classes.completedLabel,
                                                }}
                                                className="stepper_label"
                                                StepIconProps={{
                                                    classes: {
                                                        root: classes.step,
                                                        completed: classes.completed,
                                                        active: classes.active,
                                                        disabled: classes.disabled
                                                    }
                                                }}
                                            >{label}</StepLabel>
                                        </StepButton>
                                    </Step>
                                ))}
                            </Stepper>
                        </div>}
                        {/* : ""} */}
                        <div className="page_top_title_progress_bar">
                            <div style={{ 'width': this.state.activeStep === 0 && '33.33%' || this.state.activeStep === 1 && '66.66%' || this.state.activeStep === 2 && '100%' }}></div>
                        </div>
                    </div>
                    <div className="account_onboarding_stepper_content">
                        {this.state.loading ?
                            <div>
                                <Spinner />
                            </div> : <>{
                                this.getStepContent(activeStep)
                            }
                            </>
                        }
                    </div>
                </div>
            </React.Fragment>
        )
    }
}
export default withStyles(styles)(AccountOnboarding);