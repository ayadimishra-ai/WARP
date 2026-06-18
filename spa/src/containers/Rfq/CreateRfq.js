import Step from "@material-ui/core/Step";
import StepButton from "@material-ui/core/StepButton";
import StepConnector from "@material-ui/core/StepConnector";
import StepLabel from "@material-ui/core/StepLabel";
import Stepper from "@material-ui/core/Stepper";
import { withStyles } from "@material-ui/core/styles";
import axios from 'axios';
import React, { Component } from "react";
import { confirmAlert } from 'react-confirm-alert';
import { Redirect } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import NewRfq from "../../components/RFQ/NewRfq";
import RfqCongrats from "../../components/RFQ/RfqCongrats";
import RfqInviteSuppliersList from "../../components/RFQ/RfqInviteSuppliersList";
import RfqOrderDetails from "../../components/RFQ/RfqOrderDetails";
import RfqProduct from "../../components/RFQ/RfqProduct";
import RfqReview from "../../components/RFQ/RfqReview";
import { getServiceUrl, getUrlParameter, getUserPermision, getWebsiteGUID } from "../../config";
import * as PageKeys from "../../pagekeys";
import * as RoleCodes from "../../rolecodes";
import Spinner from '../../UI/Spinner/Spinner';
import { BreadCrumb } from "../../utility";

const styles = theme => ({
    step: {
        "& $completed": {
            zIndex: '99',
            color: "#fff",
            fontSize: '16px',
        },
        "& $active": {
            zIndex: '99',
            color: "#FFA93C",
            fontSize: '16px',
        },
        "& $disabled": {
            zIndex: '99',
            color: "#1C9689",
            fontSize: '16px',
        }
    },
    activeLabel: {
        zIndex: '99',
        color: "#fff !important",
        fontSize: '16px',
    },
    completedLabel: {
        zIndex: '99',
        color: "#fff !important",
        fontSize: '16px',
    },
    connectorActive: {
        top: '8px',
        left: 'calc(-50% + -8px)',
        right: 'calc(50% + 24px)',
        "& $connectorLine": {
            borderColor: 'transparent',
            height: '2px',
            background: 'repeating-linear-gradient(to right,#ffffff 0,#ffffff 5px,transparent 5px,transparent 7px)'
        }
    },
    connectorCompleted: {
        top: '8px',
        left: 'calc(-50% + -8px)',
        right: 'calc(50% + 24px)',
        "& $connectorLine": {
            borderColor: 'transparent',
            height: '2px',
            background: 'repeating-linear-gradient(to right,#ffffff 0,#ffffff 5px,transparent 5px,transparent 7px)'
        }
    },
    connectorDisabled: {
        top: '8px',
        zIndex: '9',
        left: 'calc(-50% + -8px)',
        right: 'calc(50% + 24px)',
        "& $connectorLine": {
            borderColor: 'transparent',
            height: '2px',
            background: 'repeating-linear-gradient(to right,#1C9689 0,#1C9689 5px,transparent 5px,transparent 7px)'
        }
    },
    connectorLine: {
        transition: theme.transitions.create("border-color")
    },
    alternativeLabel: {
        fontFamily: "'Sora', sans-serif !important",
        fontSize: '12px',
        fontWeight: '600',
        lineHeight: '15px',
        color: '#1C9689',
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
        width: '100px',
        "&$alternativeLabel": {
            marginTop: 0,
        }
    }
});


class CreateRfq extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeStep: 0,
            unitGuid: '',
            companyGuid: '',
            ProductGuid: '00000000-0000-0000-0000-000000000000',
            deliverylocationcount: 0,
            ProductStepData: null,
            NewRfqStepData: null,
            DeliveryStepData: null,
            OrderDetailsStep: null,
            InviteSuppliersDetails: null,
            SelectedCommodityName: "",
            SelectedCategoryName: "",
            SelectedSubCategoryName: "",
            SelectedProductTypeName: "",
            SelectedProductTypeImage: "",
            SelectedLocationList: [],
            productTypeGuid: null,
            TechnicalSpecificationsDocumentName: null,
            TechnicalSpecificationsDocument: null,
            ArtworkDocumentName: null,
            ArtworkDocument: null,
            isrfqcreated: false,
            loading: false,
            NewRfqGuid: "",
            NewRfqId: 0,
            isCatelogRFQ: false,
            isExactSupplier: false,
            exactProductDetail: null,
            SelectedSkuGuid: null,
            SelectedSkuVariants: "",
            virtualSampleData: [],
            NewSelectedSkuGuid: null,
            PlasticWeight: 0,
            DelivertyDetail: [],
            TotalQty: 0,
            CarbonEmission: 0,
            TransportEmission: 0,
            isOpenRfqPW: false,
            tquantityUnittype: "",
            tweight: 0,
            tweightunit: "",
            tweightunitguid: "",
        };
    }
    componentDidMount() {
        if(localStorage.virtualSampleData !== "" && localStorage.virtualSampleData !== undefined && localStorage.virtualSampleData !=='undefined'){            
            let virtualSampleData=[];
            JSON.parse(localStorage.virtualSampleData).map(item => {
                virtualSampleData.push(item.supplierCompanyGuid);
            })
            this.setState({ virtualSampleData: virtualSampleData });
        }
    }
    handleNext = async (Data, StepName) => {
        window.scrollTo(0, 0)
        switch (StepName) {
            case "ProductStep":
                // let SelectedCommodityName = Data.selectedCommodityName;
                // let SelectedCategoryName = Data.SelectedCategoryName;
                // let SelectedSubCategoryName = Data.SelectedSubCategoryName;
                // let SelectedProductTypeName = Data.SelectedProductTypeName;
                this.setState(state => ({
                    activeStep: state.activeStep + 1,
                    NewRfqStepData: Data,
                    // unitGuid: Data.RfqProductDetails.unitGuid,
                    // companyGuid: Data.RfqProductDetails.companyGuid,
                    // ProductGuid: Data.RfqProductDetails.ProductGuid,
                    // deliverylocationcount: Data.RfqProductDetails.deliverylocationcount,
                    // SelectedCommodityName: SelectedCommodityName,
                    // SelectedCategoryName: SelectedCategoryName,
                    // SelectedSubCategoryName: SelectedSubCategoryName,
                    // SelectedProductTypeName: SelectedProductTypeName,
                    SelectedProductTypeImage: Data.ProductTypedata === undefined ? '' : Data.ProductTypedata[0].categoryImage,
                    isCatelogRFQ: Data.isCatelogRFQ,
                    isExactSupplier: Data.isExactSupplier,
                    exactProductDetail: Data.exactProductDetail
                }));
                break;
            case "SpecificationStep":
                let SelectedCommodityName = Data.selectedCommodityName;
                let SelectedCategoryName = Data.SelectedCategoryName;
                let SelectedSubCategoryName = Data.SelectedSubCategoryName;
                let SelectedProductTypeName = Data.SelectedProductTypeName;
                let SelectedTransportation = Data.SelectedTransportation;
                if (SelectedTransportation.selectedTransportationindex === 1) {
                    this.setState(state => ({ SelectedTransportation: SelectedTransportation }));
                } else {
                    this.setState(state => ({ SelectedTransportation: SelectedTransportation }));
                }
                this.setState(state => ({
                    activeStep: state.activeStep + 1,
                    ProductStepData: Data,
                    unitGuid: Data.RfqProductDetails.unitGuid,
                    companyGuid: Data.RfqProductDetails.companyGuid,
                    ProductGuid: Data.RfqProductDetails.ProductGuid,
                    deliverylocationcount: Data.RfqProductDetails.deliverylocationcount,
                    SelectedCommodityName: SelectedCommodityName,
                    SelectedCategoryName: SelectedCategoryName,
                    SelectedSubCategoryName: SelectedSubCategoryName,
                    SelectedProductTypeName: SelectedProductTypeName,
                    SelectedProductTypeImage: Data.RfqProductDetails.ProductType.productTypeImage,
                    SelectedSkuGuid: Data.SelectedSkuGuid,
                    SelectedSkuVariants: Data.SelectedSkuVariants,
                    NewSelectedSkuGuid: Data.SelectedSkuGuid,
                    tquantityUnittype: Data.tquantityUnittype,
                    tweight: Data.tweight,
                    tweightunit: Data.tweightunit,
                    tweightunitguid: Data.tweightunitguid,
                }));

                break;
            case "DeliveryStep":
                // let SelectedTransportation = Data.SelectedTransportation;
                // if (SelectedTransportation.selectedTransportationindex === 1) {
                //     let details = Data.deliveryDetails.filter((item) => item.IsSelected === true).map(({ key, label, DeliveryLocation, streetLines, city, countryCode, postalCodestateOrProvinceCode, IsSelected }) => ({ key, label, DeliveryLocation, streetLines, city, countryCode, postalCodestateOrProvinceCode, IsSelected }));
                //     this.setState(state => ({ activeStep: state.activeStep + 1, DeliveryStepData: Data, SelectedLocationList: details, SelectedTransportation: SelectedTransportation }));
                // } else {
                //     this.setState(state => ({ activeStep: state.activeStep + 1, DeliveryStepData: Data, SelectedTransportation: SelectedTransportation }));
                // }

                break;
            case "OrderDetailsStep":
                // if (this.state.unitGuid != '' && this.state.unitGuid != null && this.state.unitGuid != undefined) {
                //     this.setState(state => ({ activeStep: state.activeStep + 1, InviteSuppliersDetails: Data.InviteSuppliersDetails }));
                // }
                let LocationdetailsList = [];
                let SelectedLocationListData = Data.RfqFullfillmentData.DeliveryDetails
                if (this.state.SelectedTransportation.selectedTransportationindex === 1) {
                    for (const key in SelectedLocationListData) {
                        if (Object.hasOwnProperty.call(SelectedLocationListData, key)) {
                            const element = SelectedLocationListData[key];
                            let Locationdetails = {
                                SelectedUOM: element.SelectedUOM,
                                Qty: element.qtyvalue,
                                price: element.price,
                                LocationName: element.selectedLocation,
                                LocationId: element.addressGuid,
                                selectedUOMText: element.selectedUOMText,
                                productCo2: element.productCo2,
                                transportCo2: element.transportCo2,
                                totalProductCo2: element.totalProductCo2,
                                carbonEmissionUnit: element.carbonEmissionUnit,
                                exactPlasticWeight:Data.exactPlasticWeight
                            }
                            LocationdetailsList.push(Locationdetails);
                        }
                    }
                } else {
                    for (const key in SelectedLocationListData) {
                        if (Object.hasOwnProperty.call(SelectedLocationListData, key)) {
                            const element = SelectedLocationListData[key];
                            let Locationdetails = {
                                SelectedUOM: element.SelectedUOM,
                                Qty: element.qtyvalue,
                                price: element.price,
                                LocationName: "",
                                LocationId: "",
                                selectedUOMText: element.selectedUOMText,
                                productCo2: element.productCo2,
                                transportCo2: element.transportCo2,
                                totalProductCo2: element.totalProductCo2,
                                carbonEmissionUnit: element.carbonEmissionUnit,
                                exactPlasticWeight:Data.exactPlasticWeight
                            }
                            LocationdetailsList.push(Locationdetails);
                        }
                    }
                }


                const updatedNewRfqProductDetailsInfo = {
                    ...this.state.ProductStepData.RfqProductDetails
                };
                let ApplicationValue = updatedNewRfqProductDetailsInfo["Application"].value;
                let SelectedProductTypeValue = updatedNewRfqProductDetailsInfo["ProductType"].productTypeName;
                let TechnicalSpecificationsDocumentName = updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].DocumentName;
                let TechnicalSpecificationsDocument = updatedNewRfqProductDetailsInfo["TechnicalSpecificationFile"].Document;

                let ArtworkDocumentName = updatedNewRfqProductDetailsInfo["artworkFile"].DocumentName;
                let ArtworkDocument = updatedNewRfqProductDetailsInfo["artworkFile"].Document;
                var Details = {
                    AdditionalIstruction: Data.RfqFullfillmentData.AdditionalIstruction,
                    Issharetechnicalspecificationdocument: Data.RfqFullfillmentData.Issharetechnicalspecificationdocument,
                    ExpectedDeliveryDate: Data.RfqFullfillmentData.ExpectedDeliveryDate,
                    SelectedLocationList: LocationdetailsList,
                    ApplicationValue: ApplicationValue,
                    SelectedProductTypeValue: SelectedProductTypeValue,
                    IsSampleRequired: Data.RfqFullfillmentData.IsSampleRequired,
                    IsAllowPartialShipment: Data.RfqFullfillmentData.IsAllowPartialShipment,
                    AllowPercentage: Data.RfqFullfillmentData.AllowPercentage,
                    IsAllowOveruns: Data.RfqFullfillmentData.IsAllowOveruns,
                    IsAllowUnderruns: Data.RfqFullfillmentData.IsAllowUnderruns,
                };
                let productTypeGuid = this.state.ProductStepData.RfqProductDetails["ProductType"].value;
                this.setState(state => ({
                    activeStep: state.activeStep + 1, OrderDetailsStep: Details,
                    TechnicalSpecificationsDocumentName: TechnicalSpecificationsDocumentName,
                    TechnicalSpecificationsDocument: TechnicalSpecificationsDocument,
                    ArtworkDocumentName: ArtworkDocumentName,
                    ArtworkDocument: ArtworkDocument,
                    productTypeGuid: productTypeGuid,
                    PlasticWeight: Data.PlasticWeight,
                    CarbonEmission: Data.CarbonEmission,
                    TransportEmission: Data.TransportEmission,
                    DelivertyDetail: SelectedLocationListData,
                    TotalQty: Data.RfqFullfillmentData.totalQty,
                    isOpenRfqPW: Data.isOpenRfqPW
                }));
                break;
            case "InviteSuppliersStep":
                this.setState(state => ({ activeStep: state.activeStep + 1, InviteSuppliersDetails: Data }));
                break;
            case "ReviewStep":
                // if (this.state.unitGuid != '' && this.state.unitGuid != null && this.state.unitGuid != undefined) {
                //     this.setState(state => ({ activeStep: state.activeStep + 1 }));
                // }
                var isValid = this.state.InviteSuppliersDetails.filter((item) => item.IsChecked === true);
                if (isValid.length > 0) {
                    // let ProductStepData = this.state.ProductStepData;
                    // let DeliveryStepData = this.state.DeliveryStepData;
                    let OrderDetailsStep = this.state.OrderDetailsStep;
                    // let InviteSuppliersDetails = this.state.InviteSuppliersDetails;
                    let uuid = uuidv4();
                    //this.setState(state => ({ InviteSuppliersDetails: Data }));
                    let rfqTitle = this.state.NewRfqStepData.rfqTitle;
                    let selectedCommodity = this.state.ProductStepData.selectedCommodity !== undefined ? this.state.ProductStepData.selectedCommodity !== null && this.state.ProductStepData.selectedCommodity !== "" ? this.state.ProductStepData.selectedCommodity : '00000000-0000-0000-0000-000000000000' : '00000000-0000-0000-0000-000000000000';
                    let SelectedCategory = this.state.ProductStepData.SelectedCategory !== undefined ? this.state.ProductStepData.SelectedCategory !== null && this.state.ProductStepData.SelectedCategory !== "" ? this.state.ProductStepData.SelectedCategory : '00000000-0000-0000-0000-000000000000' : '00000000-0000-0000-0000-000000000000';
                    let SelectedSubCategory = this.state.ProductStepData.SelectedSubCategory !== undefined ? this.state.ProductStepData.SelectedSubCategory !== null && this.state.ProductStepData.SelectedSubCategory !== "" ? this.state.ProductStepData.SelectedSubCategory : '00000000-0000-0000-0000-000000000000' : '00000000-0000-0000-0000-000000000000';
                    let productTypeGuid1 = this.state.ProductStepData.RfqProductDetails["ProductType"].value;
                    let Application = this.state.ProductStepData.RfqProductDetails["Application"].value;
                    let TechnicalSpecificationFile = this.state.ProductStepData.RfqProductDetails["TechnicalSpecificationFile"].value;
                    let artworkFile = this.state.ProductStepData.RfqProductDetails["artworkFile"].value;
                    let TransportationOwnershipGuid = this.state.SelectedTransportation.transportationOwnershipGuid;
                    let ExpectedDeliveryDate = this.state.OrderDetailsStep.ExpectedDeliveryDate;
                    let Additionalinstructions = this.state.OrderDetailsStep.AdditionalIstruction;
                    let SupplierTechnicalDocumentIsMandatory = this.state.OrderDetailsStep.Issharetechnicalspecificationdocument;
                    let PartialShipmentAllowed = this.state.OrderDetailsStep.IsAllowPartialShipment;
                    let IsSampleRequired = this.state.OrderDetailsStep.IsSampleRequired;
                    let IsAllowOverruns = this.state.OrderDetailsStep.IsAllowOveruns;
                    let IsAllowUnderruns = this.state.OrderDetailsStep.IsAllowUnderruns;
                    let OverrunsUnderrunsPercentage = this.state.OrderDetailsStep.AllowPercentage;
                    let SkuGuid = this.state.SelectedSkuGuid;
                    let SkuVariants = this.state.SelectedSkuVariants;
                    let PlasticWeight = this.state.PlasticWeight;
                    let CarbonEmission = this.state.CarbonEmission;
                    let TransportEmission = this.state.TransportEmission;

                    let RFQFullfillmentDetails = [];
                    let RfqSupplierList = [];
                    OrderDetailsStep.SelectedLocationList.map((item) => {
                        let details = {
                            AddressGuid: (typeof (item.LocationId) !== "number" && item.LocationId !== "" ? item.LocationId : "00000000-0000-0000-0000-000000000000"),
                            UnitGuid: item.SelectedUOM,
                            Quantity: item.Qty,
                            TransportEmission :item.transportCo2,
                            CarbonEmission :item.productCo2,
                            PlasticWeight:item.exactPlasticWeight * item.Qty
                        }
                        RFQFullfillmentDetails.push(details);
                    });
                    this.state.InviteSuppliersDetails.map((item) => {
                        if (item.IsChecked) {
                            let details = {
                                SupplierCompanyGuid: item.companyGuid
                            }
                            RfqSupplierList.push(details);
                        }
                        return null;
                    });
                    this.setState({ loading: true });
                    var body = {
                        'RFQGuid': uuid,
                        'RFQTitle': rfqTitle,
                        'CommodityGuid': selectedCommodity,
                        'CategoryGuid': SelectedCategory,
                        'SubCategoryGuid': SelectedSubCategory,
                        'ProductTypeGuid': productTypeGuid1,
                        "Application": Application,
                        'TechnicalSpecificationDocumentName': TechnicalSpecificationFile,
                        'SupplierTechnicalDocumentIsMandatory': SupplierTechnicalDocumentIsMandatory,
                        'ArtworkFileName': artworkFile,
                        'TransportationOwnershipGuid': TransportationOwnershipGuid,
                        'ExpectedDeliveryDate': ExpectedDeliveryDate,
                        'Additionalinstructions': Additionalinstructions,
                        'CreatedBy': localStorage.userId,
                        'RFQFullfillmentDetails': RFQFullfillmentDetails,
                        'RfqSupplierList': RfqSupplierList,
                        'ProductGuid': this.state.ProductGuid,
                        'PartialShipmentAllowed': PartialShipmentAllowed,
                        'IsSampleRequired': IsSampleRequired,
                        'IsAllowOverruns': IsAllowOverruns,
                        'IsAllowUnderruns': IsAllowUnderruns,
                        'OverrunsUnderrunsPercentage': OverrunsUnderrunsPercentage,
                        'SkuGuid': SkuGuid,
                        'SkuVariants': SkuVariants,
                        'PlasticWeight': PlasticWeight,
                        'CarbonEmission': CarbonEmission,
                        'TransportEmission': TransportEmission

                    };
                    let siteGUID = getWebsiteGUID();
                    var config = {
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.tokenId,
                            'Content-Type': 'application/json',
                            'websiteGuid': siteGUID
                        },
                    };
                    await axios.post(getServiceUrl() + 'Rfq/CreateRFQ?', body, config)
                        .then((response) => {
                            if (response.status === 200) {
                                this.setState({ loading: false, isrfqcreated: true, NewRfqGuid: uuid, NewRfqId: response.data });
                                if (TechnicalSpecificationFile !== "") {
                                    this.fileUpload("RFQTechnicalSpecifications", uuid);
                                }
                                if (artworkFile !== "") {
                                    this.fileUpload("RFQArtwork", uuid);
                                }
                                // if (this.state.unitGuid != '' && this.state.unitGuid != null && this.state.unitGuid != undefined) {
                                //     this.setState(state => ({ activeStep: state.activeStep + 1 }));
                                // }
                                // else{
                                //     this.setState(state => ({ activeStep: state.activeStep + 2 }));
                                // }
                                this.setState(state => ({ activeStep: state.activeStep + 2 }));

                            }
                        }).catch((err) => {
                            console.log(err);
                            confirmAlert({
                                message: "Something went wrong. Please try again.",
                                buttons: [
                                    {
                                        label: 'OK',
                                        onClick: () => {
                                        }
                                    }
                                ]
                            });
                        });
                } else {
                    confirmAlert({
                        message: "select at least one supplier.",
                        buttons: [
                            {
                                label: 'OK',
                                // onClick: () => {
                                //   // window.location.href = "/rfqlisting";
                                // }
                            }
                        ]
                    });
                }
                break;

            default:
                break;
        }

    };


    fileUpload = async (UploadType, Rfqid) => {
        this.setState({ loading: true });
        const formData = new FormData();
        let TechnicalSpecificationFiledocument = this.state.ProductStepData.RfqProductDetails["TechnicalSpecificationFile"].Document;
        let artworkFiledocument = this.state.ProductStepData.RfqProductDetails["artworkFile"].Document;

        let TechnicalSpecificationFile = this.state.ProductStepData.RfqProductDetails["TechnicalSpecificationFile"].value;
        let artworkFile = this.state.ProductStepData.RfqProductDetails["artworkFile"].value;
        if (UploadType === "RFQTechnicalSpecifications") {
            formData.append(
                "files",
                TechnicalSpecificationFiledocument,
                TechnicalSpecificationFile
            );
        }
        if (UploadType === "RFQArtwork") {
            formData.append(
                "files",
                artworkFiledocument,
                artworkFile
            );
        }

        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "multipart/form-data",
                "UploadType": UploadType,
                "UserGuid": localStorage.userId,
                "FolderName": 'RFQ',
                "facilityGuid": Rfqid
            }
        };
        // await axios.post(
        //     getServiceUrl() +
        //     "FileUpload/uploadfile",
        //     formData,
        //     config
        // )
        //     .then(response => {
        //         this.setState({ loading: false });
        //     }).catch((err) => {
        //         this.setState({ loading: false });
        //         console.log(err);
        //     });
    }

    gotoHomePage = () => {
        this.setState(state => ({
            activeStep: 0,
            ProductStepData: null,
            DeliveryStepData: null,
            OrderDetailsStep: null,
            InviteSuppliersDetails: null,
            SelectedLocationList: [],
            productTypeGuid: null,
            TechnicalSpecificationsDocumentName: null,
            TechnicalSpecificationsDocument: null,
            ArtworkDocumentName: null,
            ArtworkDocument: null,
            loading: false
        }));
        this.props.history.push("/rfqlisting");
    }

    gotoDashboard = () => {
        let url = '/rfqlisting?rfqguid=' + this.state.NewRfqGuid;
        this.props.history.push(url)
    }

    handleBack = (stepName) => {
        window.scrollTo(0, 0)
        // if (stepName == "ReviewStep") {
        //     if (this.state.unitGuid != '' && this.state.unitGuid != null && this.state.unitGuid != undefined) {
        //         this.setState(state => ({ activeStep: state.activeStep - 1 }));
        //     }
        // }
        this.setState(state => ({
            activeStep: state.activeStep - 1,
        }));
    };

    handleReset = () => {
        this.setState({
            activeStep: 0,
        });
    };
    handleStep = step => () => {
        this.setState({
            activeStep: step
        });
    };
    getSteps() {
        let params = getUrlParameter("productguid");
        let rfqsteps = ['General', 'Specifications', 'Delivery', 'Suppliers', 'Preview', 'Submit'];
        if (params && params != null) {
            rfqsteps = ['General', 'Specifications', 'Delivery', 'Suppliers', 'Preview', 'RFQ Created'];
        }
        return rfqsteps;
    }
    getStepContent(stepIndex) {
        // console.log(this.handleNext)
        switch (stepIndex) {
            case 0:
                return <NewRfq
                    stepNext={(Data, StepName) => this.handleNext(Data, StepName)}
                    NewRfqStepData={this.state.NewRfqStepData} />;
            case 1:
                return <RfqProduct
                    stepNext={(Data, StepName) => this.handleNext(Data, StepName)}
                    stepBack={() => this.handleBack()}
                    NewRfqStepData={this.state.NewRfqStepData}
                    ProductStepData={this.state.ProductStepData}
                    SelectedTransportation={this.state.SelectedTransportation}
                    isCatelogRFQ={this.state.isCatelogRFQ}
                    exactProductDetail={this.state.exactProductDetail}
                    virtualSampleData={this.state.virtualSampleData}
                    NewSelectedSkuGuid={this.state.NewSelectedSkuGuid}
                />;
            case 2:
                return <RfqOrderDetails
                    stepNext={(Data, StepName) => this.handleNext(Data, StepName)}
                    stepBack={() => this.handleBack()}
                    SelectedCommodityName={this.state.SelectedCommodityName}
                    SelectedCategoryName={this.state.SelectedCategoryName}
                    SelectedSubCategoryName={this.state.SelectedSubCategoryName}
                    SelectedProductTypeName={this.state.SelectedProductTypeName}
                    SelectedTransportation={this.state.SelectedTransportation}
                    SelectedLocationList={this.state.SelectedLocationList}
                    selectedData={this.state.OrderDetailsStep}
                    unitguid={this.state.unitGuid}
                    companyGuid={this.state.companyGuid}
                    producttypeicon={this.state.SelectedProductTypeImage}
                    isCatelogRFQ={this.state.isCatelogRFQ}
                    exactProductDetail={this.state.exactProductDetail}
                    virtualSampleData={this.state.virtualSampleData}
                    ProductGuid={this.state.ProductGuid}
                    SelectedSkuGuid={this.state.SelectedSkuGuid}
                    NewRfqStepData={this.state.NewRfqStepData}
                    tquantityUnittype= {this.state.tquantityUnittype}
                    tweight= {this.state.tweight}
                    tweightunit= {this.state.tweightunit}
                    tweightunitguid= {this.state.tweightunitguid}
                />;
            // return <RfqDelivery
            //     stepNext={(Data, StepName) => this.handleNext(Data, StepName)}
            //     stepBack={() => this.handleBack()}
            //     SelectedCommodityName={this.state.SelectedCommodityName}
            //     SelectedCategoryName={this.state.SelectedCategoryName}
            //     SelectedSubCategoryName={this.state.SelectedSubCategoryName}
            //     SelectedProductTypeName={this.state.SelectedProductTypeName}
            //     deliverylocationcount={this.state.deliverylocationcount}
            // />;
            case 3:
                // return <RfqOrderDetails
                //     stepNext={(Data, StepName) => this.handleNext(Data, StepName)}
                //     stepBack={() => this.handleBack()}
                //     SelectedCommodityName={this.state.SelectedCommodityName}
                //     SelectedCategoryName={this.state.SelectedCategoryName}
                //     SelectedSubCategoryName={this.state.SelectedSubCategoryName}
                //     SelectedProductTypeName={this.state.SelectedProductTypeName}
                //     SelectedTransportation={this.state.SelectedTransportation}
                //     SelectedLocationList={this.state.SelectedLocationList}
                //     selectedData={this.state.OrderDetailsStep}
                //     unitguid={this.state.unitGuid}
                //     producttypeicon={this.state.SelectedProductTypeImage}
                // />;
                return <RfqInviteSuppliersList
                    stepNext={(Data, StepName) => this.handleNext(Data, StepName)}
                    stepBack={() => this.handleBack()}
                    SelectedCommodityName={this.state.SelectedCommodityName}
                    SelectedCategoryName={this.state.SelectedCategoryName}
                    SelectedSubCategoryName={this.state.SelectedSubCategoryName}
                    SelectedProductTypeName={this.state.SelectedProductTypeName}
                    productTypeGuid={this.state.productTypeGuid}
                    producttypeicon={this.state.SelectedProductTypeImage}
                    selectedData={this.state.OrderDetailsStep}
                    InviteSuppliersDetails={this.state.InviteSuppliersDetails}
                    NewRfqStepData={this.state.NewRfqStepData}
                    isCatelogRFQ={this.state.isCatelogRFQ}
                    exactProductDetail={this.state.exactProductDetail}
                    virtualSampleData={this.state.virtualSampleData}
                    SelectedSkuGuid={this.state.SelectedSkuGuid}
                    PlasticWeight={this.state.PlasticWeight}
                    DelivertyDetail={this.state.DelivertyDetail}
                    TotalQty={this.state.TotalQty}
                    isOpenRfqPW={this.state.isOpenRfqPW}
                    SelectedTransportation={this.state.SelectedTransportation}
                    tquantityUnittype= {this.state.tquantityUnittype}
                    tweight= {this.state.tweight}
                    tweightunit= {this.state.tweightunit}
                    tweightunitguid= {this.state.tweightunitguid}
                />;
            case 4:
                return <RfqReview
                    stepNext={(Data, StepName) => this.handleNext(Data, StepName)}
                    stepBack={(stepName) => this.handleBack(stepName)}
                    SelectedCommodityName={this.state.SelectedCommodityName}
                    SelectedCategoryName={this.state.SelectedCategoryName}
                    SelectedSubCategoryName={this.state.SelectedSubCategoryName}
                    SelectedProductTypeName={this.state.SelectedProductTypeName}
                    SelectedTransportation={this.state.SelectedTransportation}
                    SelectedLocationList={this.state.SelectedLocationList}
                    selectedData={this.state.OrderDetailsStep}
                    // ProductStepData={this.state.ProductStepData}
                    TechnicalSpecificationsDocumentName={this.state.TechnicalSpecificationsDocumentName}
                    TechnicalSpecificationsDocument={this.state.TechnicalSpecificationsDocument}
                    ArtworkDocumentName={this.state.ArtworkDocumentName}
                    ArtworkDocument={this.state.ArtworkDocument}
                    rfqTitle={this.state.NewRfqStepData.rfqTitle}
                    unitguid={this.state.unitGuid}
                    companyGuid={this.state.companyGuid}
                    isrfqcreated={this.state.isrfqcreated}
                    producttypeicon={this.state.SelectedProductTypeImage}
                    InviteSuppliersDetails={this.state.InviteSuppliersDetails}
                    NewRfqStepData={this.state.NewRfqStepData}
                    isCatelogRFQ={this.state.isCatelogRFQ}
                    exactProductDetail={this.state.exactProductDetail}
                    virtualSampleData={this.state.virtualSampleData}
                    SelectedSkuGuid={this.state.SelectedSkuGuid}
                    NewRfqStepData={this.state.NewRfqStepData}
                    ProductGuid={this.state.ProductGuid}
                    PlasticWeight={this.state.PlasticWeight}
                    DelivertyDetail={this.state.DelivertyDetail}
                    isOpenRfqPW={this.state.isOpenRfqPW}
                />;
            case 5: case 6:

                let totalsuppliers = 0;
                let invitedsuppliers = 0;
                this.state.InviteSuppliersDetails.map((item) => {
                    if (item.IsChecked == true) {
                        invitedsuppliers = invitedsuppliers + 1;
                    }

                    totalsuppliers = totalsuppliers + 1;
                });
                return <RfqCongrats
                    SelectedCommodityName={this.state.SelectedCommodityName}
                    SelectedCategoryName={this.state.SelectedCategoryName}
                    SelectedSubCategoryName={this.state.SelectedSubCategoryName}
                    SelectedProductTypeName={this.state.SelectedProductTypeName}
                    SelectedTransportation={this.state.SelectedTransportation !== undefined && this.state.SelectedTransportation !== null ? this.state.SelectedTransportation.tranportationOwnership : ""}
                    selectedData={this.state.OrderDetailsStep}
                    TechnicalSpecificationsDocumentName={this.state.TechnicalSpecificationsDocumentName}
                    TechnicalSpecificationsDocument={this.state.TechnicalSpecificationsDocument}
                    ArtworkDocumentName={this.state.ArtworkDocumentName}
                    ArtworkDocument={this.state.ArtworkDocument}
                    NoofSuppliers={totalsuppliers}
                    InvitedSuppliers={invitedsuppliers}
                    ApplicationValue={this.state.OrderDetailsStep !== undefined && this.state.OrderDetailsStep !== null ? this.state.OrderDetailsStep.ApplicationValue : ""}
                    gotoDashboard={() => this.gotoDashboard()}
                    gotoHomePage={() => this.gotoHomePage()}
                    isBuyer={true}
                    NewRfqId={this.state.NewRfqId}
                    producttypeicon={this.state.SelectedProductTypeImage}
                    isCatelogRFQ={this.state.isCatelogRFQ}
                    exactProductDetail={this.state.exactProductDetail}
                    ProductGuid={this.state.ProductGuid}
                    orderdetail={this.state.OrderDetailsStep}
                    virtualSampleData={this.state.virtualSampleData}
                    SelectedSkuGuid={this.state.SelectedSkuGuid}
                    NewRfqStepData={this.state.NewRfqStepData}
                    CarbonEmission={this.state.CarbonEmission}
                    TransportEmission={this.state.TransportEmission}
                    supplierCompanyGuid={this.state.exactProductDetail !== null && this.state.exactProductDetail !== undefined ? this.state.exactProductDetail.supplierCompanyGuid : ""}
                />
            default:
                return 'Unknown stepIndex';
        }
    }


    render() {
        let permissions = localStorage.permissions !== undefined ? JSON.parse(localStorage.permissions) : [];
        if (permissions.length === 0) {
            return <Redirect to="/not-found" />;
        } else if (getUserPermision(permissions, PageKeys.CreateRFQ) === null) {
            return <Redirect to="/not-found" />;
        }

        let breadCrumb = null;
        if (JSON.parse(localStorage.userType) === RoleCodes.BUYER) {
            breadCrumb = BreadCrumb([{ 'pageName': 'Shop', 'url': '/shop' },
            { 'pageName': 'RFQ Listing', 'url': '/rfqlisting' },
            { 'pageName': 'Create RFQ', 'url': '/#' }
            ])
        }
        if (
            localStorage.getItem("IsAuthentic") === "false" ||
            localStorage.getItem("IsAuthentic") === false
        ) {
            return <Redirect to="/" />;
        }
        const { classes } = this.props;
        const connector = (
            <StepConnector
                classes={{
                    active: classes.connectorActive,
                    completed: classes.connectorCompleted,
                    disabled: classes.connectorDisabled,
                    line: classes.connectorLine
                }}
            />
        );
        const steps = this.getSteps();
        const { activeStep } = this.state;
        return (
            <React.Fragment>
                <div className="breadtitle_wrap steppercontainer">
                    {breadCrumb}
                    <div className="page_top_title">
                        {/* <h5>RFQ #####</h5> */}
                        <div className="page_heading">
                            {this.state.activeStep === 6 ? 'RFQ Created' :  'Create RFQ'}
                        </div>
                        <div className="rfq_stepper_div common_stepper_cont">
                            <Stepper className="rfq_stepper common_stepper" connector={connector} activeStep={activeStep} alternativeLabel>
                                {steps.map((label, index) => (

                                    this.state.isrfqcreated == true ?
                                        <Step
                                            key={label}
                                            classes={{
                                                root: classes.step,
                                                completed: classes.completed,
                                                active: classes.active,
                                                disabled: classes.disabled
                                            }}>
                                            <StepButton>
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
                                                            disabled: classes.disabled
                                                        }
                                                    }}
                                                >{label}</StepLabel>
                                            </StepButton>
                                        </Step>
                                        :
                                        <Step
                                            key={label}
                                            classes={{
                                                root: classes.step,
                                                completed: classes.completed,
                                                active: classes.active,
                                                disabled: classes.disabled
                                            }}>
                                            <StepButton onClick={this.handleStep(index)}>
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
                        </div>
                        <div className="page_top_title_progress_bar">
                            <div style={{ 'width': this.state.activeStep === 0 && '16.66%' || this.state.activeStep === 1 && '33.32%' || this.state.activeStep === 2 && '49.98%' || this.state.activeStep === 3 && '66.64%' || this.state.activeStep === 4 && '83.3%' || this.state.activeStep === 5 && '100%' }}></div>
                        </div>
                    </div>
                </div>
                < div className=" new_ui_container create_rfq">
                    <div>
                        <div>
                            <div style={({ display: this.state.loading ? 'none' : 'block' })}>
                                <div className="Rfq_steps_content">{this.getStepContent(activeStep)}</div>
                            </div>
                            <div style={({ display: this.state.loading ? 'block' : 'none' })}>
                                <Spinner />
                            </div>
                            {/* <div>
                  <Button
                    disabled={activeStep === 0}
                    onClick={this.handleBack}
                    blackBtnSimple
                  >
                    Back
                  </Button>
                  <Button orangeSubmit onClick={this.handleNext("", "")}>
                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                  </Button>
                </div> */}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}
export default withStyles(styles)(CreateRfq);