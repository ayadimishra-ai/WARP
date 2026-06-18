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
import RfqCongrats from "../../components/RFQ/RfqCongrats";
import RfqCostDetails from "../../components/RFQ/RfqCostDetails";
import RfqEditPreview from "../../components/RFQ/RfqEditPreview";
import RfqTermsOfSale from "../../components/RFQ/RfqTermsOfSale";
import { getServiceUrl, getUserPermision } from "../../config";
import * as PageKeys from "../../pagekeys";
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
        width: '75px',
        "&$alternativeLabel": {
            marginTop: 0,
        }
    }
});


class EditRfq extends Component {
    constructor(props) {
        super(props);
        this.state = {
            RfqCostDetailsStep: null,
            RfqTermsOfSaleStep: null,
            congratMessage: "",
            activeStep: 0,
            SupplierStatus: "",
            showemmissiondata: "none",
            showemmissiondatatable: [],
            totalquantity: 0,
            totalpricing: 0
        };
    }
    async componentDidMount() {
        let qty = 0, totalprice = 0;
        if (this.props.rfqFullfillmentDetails != null && this.props.rfqFullfillmentDetails != "" && this.props.rfqFullfillmentDetails != undefined) {
            if (this.props.rfqFullfillmentDetails.length > 0) {
                this.props.rfqFullfillmentDetails.map((item, index) => {
                    qty = parseFloat(item.quantity) + parseFloat(qty);
                    if (index == 0) {
                        totalprice = parseFloat(totalprice) + parseFloat(parseFloat(item.quantity) * parseFloat(item.price)) + parseFloat(item.gstCost) + parseFloat(item.freightCosts);
                    }
                    else {
                        totalprice = parseFloat(totalprice) + parseFloat(parseFloat(item.quantity) * parseFloat(item.price));
                    }
                })
            }
        }
        if (this.props.additionalCharges != null && this.props.additionalCharges != "" && this.props.additionalCharges != undefined) {
            if (this.props.additionalCharges.length > 0) {
                this.props.additionalCharges.map(item => {
                    totalprice = parseFloat(totalprice) + parseFloat(item.cost);
                })
            }
        }
        await this.setState({ totalquantity: qty, totalpricing: totalprice })
        if (this.props.rfqGeneralDetails.productguid !== '00000000-0000-0000-0000-000000000000') {
            await this.getproductcarbonemission(this.props.rfqGeneralDetails.productguid, this.props.rfqGeneralDetails.skuguid, qty);
        }
        if (this.props.isEditMode !== undefined && this.props.isEditMode !== null) {
            if (this.props.isEditMode === false) {
                await this.setState({ activeStep: 2 });
            }
        }

        if (this.props.additionalCharges !== undefined && this.props.additionalCharges !== null) {
            if (this.props.rfqGeneralDetails !== undefined && this.props.rfqGeneralDetails !== null && this.props.rfqGeneralDetails !== "") {
                let details = {
                    additionalCharges: this.props.additionalCharges,
                    PaymentTerms: this.props.rfqGeneralDetails.paymentTerms
                }
                await this.setState({ RfqCostDetailsStep: details });
            }
            else {
                let details = {
                    additionalCharges: this.props.additionalCharges
                }
                await this.setState({ RfqCostDetailsStep: details });
            }
        }

        if (this.props.termsOfSale !== undefined && this.props.termsOfSale !== null) {
            this.setState({ RfqTermsOfSaleStep: this.props.termsOfSale });
        }
    }
    async getproductcarbonemission(ProductGuid, SkuGuid, totalqty) {
        let formbody = {};
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'ProductGuid': ProductGuid,
                'SkuGuid': SkuGuid,
                'Quantity': totalqty
            },
        };
        await axios
            .post(getServiceUrl() + "Product/GetProductCarbonEmissionDetails?", formbody, config)
            .then((response) => {
                if (response != null) {
                    this.setState({ showemmissiondatatable: response.data.table1, showemmissiondata: "flex" });
                }
                else {
                    this.setState({ showemmissiondata: "none" });
                }
            })
            .catch((err) => {
                console.log(err);
                this.setState({ loading: false });
                confirmAlert({
                    message: 'Something went wrong. Please try again',
                    buttons: [
                        {
                            label: 'OK'
                        }
                    ]
                });
            });
    }
    handleNext = async (data, StepName) => {
        window.scrollTo(0, 0)
        switch (StepName) {
            case "RfqCostDetails":
                if (data.showCongrats) {
                    await this.setState(state => ({ activeStep: state.activeStep + 4, congratMessage: data.Message, SupplierStatus: data.SupplierStatus }));
                } else {
                    await this.setState(state => ({ activeStep: state.activeStep + 1, RfqCostDetailsStep: data }));
                }
                break;
            case "RfqTermsOfSale":
                if (data.showCongrats) {
                    await this.setState(state => ({ activeStep: state.activeStep + 3, congratMessage: data.Message, SupplierStatus: data.SupplierStatus }));
                }
                else {
                    await this.setState(state => ({ activeStep: state.activeStep + 1, RfqTermsOfSaleStep: data }));
                }
                break;
            case "RfqEditPreview":
                this.setState(state => ({ activeStep: state.activeStep + 2, congratMessage: data.Message, SupplierStatus: data.SupplierStatus }));
                break;

            default:
                break;
        }
    };
    handleGoBack() {
        window.scrollTo(0, 0)
        const { handleGoBack = f => f } = this.props;
        handleGoBack();
    }

    handleBack = () => {
        window.scrollTo(0, 0)
        const { handleGoBack = f => f } = this.props;
        if (this.props.isEditMode === false) {
            handleGoBack();
        } else {
            this.setState(state => ({
                activeStep: state.activeStep - 1,
            }));
        }
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
        return ['Cost Details', 'Terms of Sale', 'Preview', 'Submit Response'];
        // return ['Cost Details', 'Terms of Sale', 'Preview', 'Submit RFQ'];
    }
    getStepContent(stepIndex) {
        let selectedCommodity = this.props.SelectedCommodityName !== undefined && this.props.SelectedCommodityName != "" ? this.props.SelectedCommodityName : "";
        let SelectedCategory = this.props.SelectedCategoryName !== undefined && this.props.SelectedCategoryName != "" ? this.props.SelectedCategoryName : "";
        let SelectedSubCategory = this.props.SelectedSubCategoryName !== undefined && this.props.SelectedSubCategoryName != "" ? this.props.SelectedSubCategoryName : "";
        let SelectedProductTypeName = this.props.SelectedProductTypeName !== undefined && this.props.SelectedProductTypeName != "" ? this.props.SelectedProductTypeName : "";
        switch (stepIndex) {
            case 0:
                let data = this.props.rfqFullfillmentDetails;
                return <RfqCostDetails
                    stepNext={(data) => this.handleNext(data, "RfqCostDetails")}
                    isBuyer={this.props.isBuyer}
                    rfqGeneralDetails={this.props.rfqGeneralDetails}
                    SupplierResp={this.props.SupplierResp}
                    rfqFullfillmentDetails={this.state.RfqCostDetailsStep !== undefined && this.state.RfqCostDetailsStep !== null ? this.state.RfqCostDetailsStep.RfqFullfillmentDetails !== undefined && this.state.RfqCostDetailsStep.RfqFullfillmentDetails !== null ? this.state.RfqCostDetailsStep.RfqFullfillmentDetails : this.props.rfqFullfillmentDetails : this.props.rfqFullfillmentDetails}
                    additionalCharges={this.state.RfqCostDetailsStep !== undefined && this.state.RfqCostDetailsStep !== null ? this.state.RfqCostDetailsStep.additionalCharges : this.props.additionalCharges}
                    costDetailsPage={this.props.costDetailsPage}
                    totalFullfillmentCost={this.props.totalFullfillmentCost}
                    CategoryDetails={this.props.CategoryDetails}
                    stepBack={this.props.handleGoBack}
                    IsRfqReview={false}
                    isEditMode={this.props.isEditMode}
                    termsOfSale={this.state.RfqTermsOfSaleStep !== undefined && this.state.RfqTermsOfSaleStep !== null ? this.state.RfqTermsOfSaleStep : this.props.termsOfSale}
                    RfqComments={this.props.RfqComments}
                    SelectedCommodityName={selectedCommodity}
                    SelectedCategoryName={SelectedCategory}
                    SelectedSubCategoryName={SelectedSubCategory}
                    SelectedProductTypeName={SelectedProductTypeName}
                    PaymentTerms={this.state.RfqCostDetailsStep !== undefined && this.state.RfqCostDetailsStep !== null ? this.state.RfqCostDetailsStep.PaymentTerms : this.props.rfqGeneralDetails.paymentTerms}
                    exactProductDetail={this.props.exactProductDetail}
                    isExactSupplier={this.props.isExactSupplier}
                    exactSupplierDetail={this.props.exactSupplierDetail}
                    showemmissiondatatable={this.state.showemmissiondatatable}
                    productSkuDetail={this.props.productSkuDetail}
                    virtualSampleData={this.props.virtualSampleData}
                    unitList= {this.props.unitList}
                    isOpenRfq={this.props.isOpenRfq}
                />;
            case 1:
                return <RfqTermsOfSale
                    handleGoBack={this.handleGoBack.bind(this)}
                    stepNext={(data) => this.handleNext(data, "RfqTermsOfSale")}
                    stepBack={() => this.handleBack()}
                    termsOfSale={this.state.RfqTermsOfSaleStep !== undefined && this.state.RfqTermsOfSaleStep !== null ? this.state.RfqTermsOfSaleStep : this.props.termsOfSale}
                    rfqGeneralDetails={this.props.rfqGeneralDetails}
                    CategoryDetails={this.props.CategoryDetails}
                    IsRfqReview={false}
                    supplierTechnicalDocumentIsMandatory={this.props.CategoryDetails.supplierTechnicalDocumentIsMandatory}
                    rfqFullfillmentDetails={this.state.RfqCostDetailsStep !== undefined && this.state.RfqCostDetailsStep !== null ? this.state.RfqCostDetailsStep.RfqFullfillmentDetails : this.props.rfqFullfillmentDetails}
                    additionalCharges={this.state.RfqCostDetailsStep !== undefined && this.state.RfqCostDetailsStep !== null ? this.state.RfqCostDetailsStep.additionalCharges : []}
                    PaymentTerms={this.state.RfqCostDetailsStep !== undefined && this.state.RfqCostDetailsStep !== null ? this.state.RfqCostDetailsStep.PaymentTerms : this.props.rfqGeneralDetails.paymentTerms}
                    exactProductDetail={this.props.exactProductDetail}
                    isExactSupplier={this.props.isExactSupplier}
                    showemmissiondatatable={this.state.showemmissiondatatable}
                    productSkuDetail={this.props.productSkuDetail}
                    virtualSampleData={this.props.virtualSampleData}
                />;
            case 2:
                let a = this.state.RfqCostDetailsStep;
                return <RfqEditPreview
                    handleGoBack={this.handleGoBack.bind(this)}
                    stepNext={(data) => this.handleNext(data, "RfqEditPreview")}
                    stepBack={() => this.handleBack()}
                    isBuyer={this.props.isBuyer}
                    rfqGeneralDetails={this.props.rfqGeneralDetails}
                    SupplierResp={this.props.SupplierResp}
                    rfqFullfillmentDetails={this.state.RfqCostDetailsStep !== undefined && this.state.RfqCostDetailsStep !== null ? this.state.RfqCostDetailsStep.RfqFullfillmentDetails !== undefined && this.state.RfqCostDetailsStep.RfqFullfillmentDetails !== null ? this.state.RfqCostDetailsStep.RfqFullfillmentDetails : this.props.rfqFullfillmentDetails : this.props.rfqFullfillmentDetails}
                    additionalCharges={this.state.RfqCostDetailsStep !== undefined && this.state.RfqCostDetailsStep !== null ? this.state.RfqCostDetailsStep.additionalCharges : this.props.additionalCharges}
                    costDetailsPage={this.props.costDetailsPage}
                    totalFullfillmentCost={this.props.totalFullfillmentCost}
                    CategoryDetails={this.props.CategoryDetails}
                    RfqCostDetailsStep={this.state.RfqCostDetailsStep}
                    termsOfSale={this.state.RfqTermsOfSaleStep !== undefined && this.state.RfqTermsOfSaleStep !== null ? this.state.RfqTermsOfSaleStep : this.props.termsOfSale}
                    IsRfqReview={true}
                    isEditMode={this.props.isEditMode}
                    RfqComments={this.props.RfqComments}
                    rfqRoleStatusName={this.props.CategoryDetails.rfqRoleStatusName}
                    supplierTechnicalDocumentIsMandatory={this.props.CategoryDetails.supplierTechnicalDocumentIsMandatory}
                    rFQRoleStatus={this.props.rFQRoleStatus}
                    // SelectedCommodityName={this.props.rfqProductTypeNames !== undefined && this.props.rfqProductTypeNames !== null ? this.props.rfqProductTypeNames[0].categoryName : ""}
                    // SelectedCategoryName={this.props.rfqProductTypeNames !== undefined && this.props.rfqProductTypeNames !== null ? this.props.rfqProductTypeNames[1].categoryName : ""}
                    // SelectedSubCategoryName={this.props.rfqProductTypeNames !== undefined && this.props.rfqProductTypeNames !== null ? this.props.rfqProductTypeNames[2].categoryName : ""}
                    // SelectedProductTypeName={this.props.rfqProductTypeNames !== undefined && this.props.rfqProductTypeNames !== null ? this.props.rfqProductTypeNames[3].categoryName : ""}
                    SelectedCommodityName={selectedCommodity}
                    SelectedCategoryName={SelectedCategory}
                    SelectedSubCategoryName={SelectedSubCategory}
                    SelectedProductTypeName={SelectedProductTypeName}
                    PaymentTerms={this.state.RfqCostDetailsStep !== undefined && this.state.RfqCostDetailsStep !== null ? this.state.RfqCostDetailsStep.PaymentTerms : this.props.rfqGeneralDetails.paymentTerms}
                    exactProductDetail={this.props.exactProductDetail}
                    isExactSupplier={this.props.isExactSupplier}
                    exactSupplierDetail={this.props.exactSupplierDetail}
                    showemmissiondatatable={this.state.showemmissiondatatable}
                    productSkuDetail={this.props.productSkuDetail}
                    virtualSampleData={this.props.virtualSampleData}
                />;
            case 3: case 4:
                return <div className="Rfq_steps_content">
                    <RfqCongrats
                        isEdit={true}
                        isBuyer={this.props.isBuyer}
                        rfqGeneralDetails={this.props.rfqGeneralDetails}
                        gotoDashboard={this.props.handleGoBack}
                        congratMessage={this.state.congratMessage}
                        SupplierStatus={this.state.SupplierStatus}
                        // SelectedCommodityName={this.props.rfqProductTypeNames !== undefined && this.props.rfqProductTypeNames !== null ? this.props.rfqProductTypeNames[0].categoryName : ""}
                        // SelectedCategoryName={this.props.rfqProductTypeNames !== undefined && this.props.rfqProductTypeNames !== null ? this.props.rfqProductTypeNames[1].categoryName : ""}
                        // SelectedSubCategoryName={this.props.rfqProductTypeNames !== undefined && this.props.rfqProductTypeNames !== null ? this.props.rfqProductTypeNames[2].categoryName : ""}
                        // SelectedProductTypeName={this.props.rfqProductTypeNames !== undefined && this.props.rfqProductTypeNames !== null ? this.props.rfqProductTypeNames[3].categoryName : ""}
                        SelectedCommodityName={selectedCommodity}
                        SelectedCategoryName={SelectedCategory}
                        SelectedSubCategoryName={SelectedSubCategory}
                        SelectedProductTypeName={SelectedProductTypeName}
                        SelectedTransportation={this.props.rfqFullfillmentDetails !== undefined && this.props.rfqFullfillmentDetails !== null ? this.props.rfqFullfillmentDetails[0].tranportationOwnership : ""}
                        ApplicationValue={this.props.rfqGeneralDetails !== undefined && this.props.rfqGeneralDetails !== null ? this.props.rfqGeneralDetails.applicationEndUse : ""}
                        // TechnicalSpecificationsDocumentName={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.technicalSpecificationDocumentName : ""}
                        BuyerTechnicalSpecificationsDocumentName={this.props.rfqGeneralDetails !== undefined && this.props.rfqGeneralDetails !== null ? this.props.rfqGeneralDetails.technicalSpecificationDocumentName : ""}
                        TechnicalSpecificationsDocumentName={this.state.RfqTermsOfSaleStep !== undefined && this.state.RfqTermsOfSaleStep !== null ? this.state.RfqTermsOfSaleStep.technicalSpecificationDocumentName !== undefined && this.state.RfqTermsOfSaleStep.technicalSpecificationDocumentName !== null ? this.state.RfqTermsOfSaleStep.technicalSpecificationDocumentName : "" : ""}
                        TechnicalSpecificationsDocument={null}
                        ArtworkDocumentName={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.artworkFileName : ""}
                        ArtworkDocument={null}
                        rfqGuid={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.rfqGuid : ""}
                        createdBy={this.props.rfqGeneralDetails !== undefined ? this.props.rfqGeneralDetails.createdBy : ""}
                        totalproductcost={this.state.RfqCostDetailsStep !== undefined && this.state.RfqCostDetailsStep !== null ? this.state.RfqCostDetailsStep.TotalOrderValue : ""}
                        RfqCostDetailsStep={this.state.RfqCostDetailsStep}
                        totalCarbonEmmision={this.state.RfqCostDetailsStep !== undefined && this.state.RfqCostDetailsStep !== null ? this.state.RfqCostDetailsStep.TotalCarbonEmmision : ""}
                        qtyUnit={this.props.rfqFullfillmentDetails !== undefined && this.props.rfqFullfillmentDetails !== null ? this.props.rfqFullfillmentDetails[0].name : ""}
                        gotoDashboard={() => this.gotoDashboard()}
                        gotoHomePage={() => this.gotoHomePage()}
                        exactProductDetail={this.props.exactProductDetail}
                        isExactSupplier={this.props.isExactSupplier}
                        gotoRfqViewPage={() => this.gotoRfqViewPage()}
                        showemmissiondatatable={this.state.showemmissiondatatable}
                        TotalQuantity={this.state.totalquantity}
                        productSkuDetail={this.props.productSkuDetail}
                        virtualSampleData={this.props.virtualSampleData}
                        exactSupplierDetail={this.props.exactSupplierDetail}
                    />
                </div>;
            default:
                return 'Unknown stepIndex';
        }
    }
    gotoHomePage = () => {
        // history.push("/rfqlisting")
        window.location.href = "/rfqlisting";
    }

    gotoDashboard = () => {
        //history.push("/home")
        window.location.href = "/home";
    }
    gotoRfqViewPage = () => {
        //history.push("/rfqlisting")
        window.location.href = "/rfqlisting?rfqguid=" + this.props.rfqGeneralDetails.rfqGuid + "";
    }

    render() {
        let permissions = localStorage.permissions !== undefined ? JSON.parse(localStorage.permissions) : [];
        if (permissions.length === 0) {
            return <Redirect to="/not-found" />;
        } else if (getUserPermision(permissions, PageKeys.EditRFQ) === null) {
            return <Redirect to="/not-found" />;
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
                    {BreadCrumb([{ 'pageName': 'Dashboard', 'url': '/home' },
                    { 'pageName': 'RFQ Listing', 'url': '/rfqlisting' },
                    { 'pageName': 'RFQ Details', 'url': '/rfqlisting' }
                    ])}
                    <div className="page_top_title">
                        {/* <h5>RFQ #####</h5> */}
                        <div className="page_heading">
                            {this.props.rfqGeneralDetails !== undefined && this.props.rfqGeneralDetails !== null ?
                                <>RFQ {this.props.rfqGeneralDetails.rfqId}</>
                                : ""}
                        </div>
                        <div className="rfq_stepper_div common_stepper_cont">
                            <Stepper className="rfq_stepper common_stepper" connector={connector} activeStep={activeStep === 3 ? activeStep + 1 : activeStep} alternativeLabel>
                                {steps.map((label, index) => (
                                    <Step
                                        last={true}
                                        key={label}
                                        classes={{
                                            root: classes.step,
                                            completed: classes.completed,
                                            active: classes.active,
                                            disabled: classes.disabled
                                        }}>
                                        <StepButton onClick={this.handleStep(index)}>
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
                                ))}
                            </Stepper>
                        </div>
                        <div className="page_top_title_progress_bar">
                            <div style={{ 'width': this.state.activeStep === 0 && '33.33%' || this.state.activeStep === 1 && '66.66%' || this.state.activeStep === 2 && '100%' || this.state.activeStep === 3 && '100%' }}></div>
                        </div>
                    </div>
                </div>
                <div className=" new_ui_container buyer_view_edit_rfq create_rfq">
                    <div>
                        <div>
                            <div className="Rfq_steps_content">{this.getStepContent(activeStep)}</div>
                            {/* {activeStep === 3 ? '' : <div>
                <Button
                  disabled={activeStep === 0}
                  onClick={this.handleBack}
                  blackBtnSimple
                >
                  Back
                </Button>
                <Button orangeSubmit onClick={this.handleNext}>
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>} */}
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    }
}
export default withStyles(styles)(EditRfq);