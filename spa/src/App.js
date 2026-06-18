import React from "react";
import Login from "../src/containers/Login/Login";
import SingleLogin from "../src/containers/Login/SingleLogin";
import Layout from "./components/Layout/Layout";
import PlatformSessionMonitor from "./hoc/PlatformSessionMonitor";
import { Route, Redirect } from "react-router-dom";
import ProductListingPage from "./containers/ListingPage/ProductListingPage";
import ImportExportProducts from "./containers/ImportExportProducts/ImportExport";
import Dashboard from "./containers/Dashboard/Dashboard";
import AddProduct from "./containers/AddProduct/AddProduct";
import Registration from "./containers/Registration/Registration";
import SupplierDetailsListing from "./containers/ListingPage/SupplierDetailsListing";
import PRListingForSqlDemo from "./containers/PRListing/PRListingForSqlDemo";
import PRListingView from "./containers/PRListing/PRListingView";
import POListingView from "./containers/POListing/POListingView";
import ProductDetails from "./containers/ProductDetailsPage/ProductDetails";
import { OPPrivateRoute, PrivateRoute } from "./components/CustomRoutes/PrivateRoute";
import ArtificialPunchout from "./containers/ArtificialPunchOut/ArtificalPunchout";
import Logout from "./containers/Logout/Logout";
import Verification from "./containers/Registration/Verification";
import ProductBasket from "./containers/BasketListing/BasketProducts";
import OrderDetails from "./containers/PRDetails/PRDetails";
import ThankyouPage from "./containers/ThankyouPage/ThankyouPage";
import Shop from "./containers/Shop/Shop";
import BuyingWindowList from "./containers/BuyingWindow/BuyingWindowList";
import WishlistPage from "./containers/WishlistPage/WishlistPage";
import MyAccount from "./containers/MyAccount/MyAccount";
import { withRouter, Switch } from "react-router-dom";
import CertificateDataExtraction from "./containers/CertificateDataExtraction/CertificateDataExtraction";
import NotFound from "./containers/NotFound/NotFound";
import CategoryManagement from "./containers/Management/CategoryManagement";
import CommodityManagement from "./containers/CommodityManagement/CommodityManagement";
import NotificationList from "./components/Notifications/NotificationList";
import ProductDetailsEdit from "./components/ProductDetails/ProductDetailsEdit";
import ProductDetailsEdit1 from "./components/ProductDetails/ProductDetailsEdit1";
import GlobalSettings from "./containers/GlobalSettings/GlobalSettings";
import Registration_copy from "./containers/Registration/Registration_copy";
import AddRegistrationcontrols from "./containers/AddRegistrationcontrols/AddRegistrationcontrols";

import QuetionsAns from "../src/containers/Questions/questions";
import SocialGovernQues from "../src/containers/Questions/Social&GovernQues";
import ESGReport from "../src/containers/ESG/PortfolioESGReport";
import RfqListing from "./containers/Rfq/RfqListing";
import CreateRfq from "./containers/Rfq/CreateRfq";
import EditRfq from "./containers/Rfq/EditRfq";
import BuyerRfq from "./containers/Rfq/BuyerRfq";
import BankDetails from "./containers/SupplierOnBoarding/BankDetails";
import CompanyDocuments from "./containers/SupplierOnBoarding/CompanyDocuments";
import AccountOnboarding from "./containers/AccountOnboarding/Onboarding.js";
import CompanyListing from "./containers/SupplierOnBoarding/CompanyListing";
import Questionnaires from "./containers/SupplierOnBoarding/Questionnaires";
import Assessments from "./containers/SupplierOnBoarding/Assessments";
import SupplierOnBoardingNew from "./containers/SupplierOnBoarding/SupplierOnBoardingNew";
import PredealESGReport from "./containers/ESG/PredealESGReport";
import importPartner from "./containers/ImportExportProducts/ImportPartner";
import ProductListingPage1 from "./containers/ListingPage/ProductListingPage1";

import ssologinfailed from "./containers/Dashboard/ssologinfailed";
import Preferences from "./containers/Preferences/Preference";
import GHGDashboard from "./containers/Dashboard/GHGDashboard";
import EKYCReport from "./containers/EKYC/EKYCReport";
import history from "./history";
import AssessmentDetails from "./containers/SupplierOnBoarding/AssessmentDetails";
import ESGReportToggle from "./containers/ESG/ESGReportToggle";
import BankingReport from "./containers/ESG/BankingReport";
import PredealESGReportNew from "./containers/ESG/PredealESGReportNew";
import PostdealESGReport from "./containers/ESG/PostdealESGReport";
import KhaitanESGReport from "./containers/ESG/KhaitanESGReport";
import AssessmentsOneTime from "./containers/SupplierOnBoarding/AssessmentListingOneTime";
import AssessmentsMonthly from "./containers/SupplierOnBoarding/AssessmentListingMonthly";
import AssessmentDetailsOneTime from "./containers/SupplierOnBoarding/AssessmentDetailsOneTime";
import AssessmentDetailsMonthly from "./containers/SupplierOnBoarding/AssessmentDetailsMonthly";
import Chirataereport from "./containers/ESG/ChirataeReport";
import AssessmentRecommendation from "./containers/SupplierOnBoarding/AssessmentRecommendation";
import ChirataeESGInvesteeQuestionnaireAnnual from "./containers/ESG/ChirataeESGInvesteeQuestionnaireAnnual.js";
import NewsletterUnsubscription from "../src/containers/NewsletterUnsubscription";
import CustomImpactToggle from "./containers/ESG/CustomImpactToggle.js";
import GHGActivity from "./containers/OpsContainer/GHGActivity.js";
import AssessmentIntroDetails from "./containers/SupplierOnBoarding/AssessmentIntroDetails.js";
import GHGDashboardOPs from "./containers/Dashboard/GHGDashboardOPs";
import AssessmentRecommendDetails from "./containers/SupplierOnBoarding/AssessmentRecommendDetails.js";
import ChirataePowerBI from "./containers/Dashboard/ChirataeESGInvesteePowerBi.js";
import MonthlyActivityData from "./containers/OpsContainer/MonthlyActivityData.js";
import AtherDashboard from "./containers/Dashboard/AtherDashboard";
import PowerBiReportsDashboardOps from "./containers/Dashboard/PowerBiReportDashboardOps.js";
import PowerDashboardOps from "./containers/Dashboard/PowerDashboardOps.js";
import AIStatistics from "./containers/SupplierOnBoarding/AIStatistics.js";
import PowerBiCorporateDashboardOps from "./containers/Dashboard/PowerBiCorporateDashboardOps.js";
import LogisticDashboard from "./containers/Dashboard/LogisticDashboard.js";
import LogisticClientDashboard from "./containers/Dashboard/LogisticClientDashboard.js";
import PowerBiCorporateDashboardOpsOld from "./containers/Dashboard/PowerBiCorporateDashboardOpsOld.js";
import AIVerifyExtractedData from "./containers/OpsContainer/AIVerifyExtractedData.js";
import PowerBiCorporateDashboardOpsAnthem from "./containers/Dashboard/PowerBiCorporateDashboardOPsAnthem.js";

import UserActivityMapping from "./containers/OpsContainer/UserActivityMapping.js";
import UserListingTable from "./containers/OpsContainer/UserListingTable.js";
import LocationListingTable from "./containers/OpsContainer/LocationListingTable.js";
import AddUsers from "./containers/OpsContainer/AddUsers.js";
import AddLocations from "./containers/OpsContainer/AddLocations.js";
import EnterpriseLayout from "./components/Layout/EnterpriseLayout.js";
import DocumentRepositoryPage from "./containers/DocumentRepositoryPage.js";
import GoalSetting from "./containers/OpsContainer/GoalSetting.js";
import OPPowerBiCorporateDashboard from "./containers/Dashboard/OPPowerBiCorporateDashboard.js";
import AssessmentsLock from "./containers/SupplierOnBoarding/AssessmentsLock.js";
import SupplierTracker from "./containers/OpsContainer/SupplierTracker.js";
import ChatWithSnowkapAI from "./containers/AIModules/ChatWithSnowkapAI.js";
import ManageCarbonEmissionFactors from "./containers/OpsContainer/ManageCarbonEmissionFactors.js";
import ManageUomConversionFactors from "./containers/OpsContainer/ManageUomConversionFactors.js";
import EnergyGridManualEntryActivityData from "./containers/OpsContainer/EnergyGridManualEntryActivityData.js";
import CaptivePowerManualEntryActivityData from "./containers/OpsContainer/CaptivePowerManualEntryActivityData.js";
import WasteManualEntryActivityData from "./containers/OpsContainer/WasteManualEntryActivityData.js";
import FuelConsumptionManualEntryActivityData from "./containers/OpsContainer/FuelConsumptionManualEntryActivityData.js";
import SupplierMaterialMapping from "./containers/OpsContainer/SupplierMaterialMapping.js";
import DataUploadLogSummaryLayout from "./components/Layout/DataUploadLogSummaryLayout.js";
import HealthSafetyDashboard from "./containers/Dashboard/Health&Safety.js";
import ProcurementDashboard from "./containers/Dashboard/ProcurementDashboard";
import dbMonitoring from "./containers/GlobalUtilities/dbMonitoring";
import SupplierMasterListingTable from "./containers/OpsContainer/SupplierMasterListingTable.js";

const app = () => {
  window.scrollTo(0, 0);
  return (
    <PlatformSessionMonitor>
      <Switch>
        <Route path="/not-found" component={withRouter(NotFound)} />
        <Route>
          <Layout>
            <Switch>
              {/* <Route exact path="/" component={Login} /> */}
              <Route exact path="/" component={SingleLogin} />
              <Route
                exact
                path="/NewsletterUnsubscription"
                component={NewsletterUnsubscription}
              />
              {/* <Route exact path="/supplierlogin" component={Login} /> */}
              <Route exact path="/supplierlogin" component={SingleLogin} />
              <Route exact path="/registration" component={Registration} />
              <Route
                exact
                path="/artificialpunchout"
                component={ArtificialPunchout}
              />
              <Route exact path="/login" component={SingleLogin} />
              <Route exact path="/verification" component={Verification} />
              <PrivateRoute exact path="/shop" component={Shop} />
              <Route exact path="/setnewpassword" component={SingleLogin} />
              <Route
                exact
                path="/supplierOnBoarding"
                component={SupplierOnBoardingNew}
              />
              <Route
                exact
                path="/companyOnBoarding"
                component={SupplierOnBoardingNew}
              />
              {/* <Route exact path="/snowkapteamlogin" component={SnowKapTeamLogin} /> */}
              <Route exact path="/snowkapteamlogin" component={SingleLogin} />
              <PrivateRoute
                exact
                path="/predealesgreport"
                component={PredealESGReport}
              />

              <PrivateRoute exact path="/pwcframework" component={QuetionsAns} />
              <PrivateRoute
                exact
                path="/portfolioesgreport"
                component={ESGReport}
              />
              <PrivateRoute exact path="/home" component={Dashboard} isCheckedToken={false}/>
              <PrivateRoute
                exact
                path="/listing-page"
                component={withRouter(ProductListingPage)}
              />
              <PrivateRoute
                exact
                path="/import-products"
                component={ImportExportProducts}
              />
              <PrivateRoute exact path="/add-product" component={AddProduct} />
              <PrivateRoute
                exact
                path="/supplier-listing"
                component={SupplierDetailsListing}
              />
              <PrivateRoute exact path="/prlisting" component={PRListingView} />
              <PrivateRoute exact path="/polisting" component={POListingView} />
              <PrivateRoute
                exact
                path="/prlistingforsqldemo"
                component={PRListingForSqlDemo}
              />
              <PrivateRoute
                exact
                path="/product-details"
                component={withRouter(ProductDetails)}
              />
              <PrivateRoute exact path="/logout" component={Logout} />
              <PrivateRoute
                exact
                path="/product-basket"
                component={withRouter(ProductBasket)}
              />
              <PrivateRoute
                exact
                path="/order-details"
                component={withRouter(OrderDetails)}
              />
              <PrivateRoute
                exact
                path="/thankyou"
                component={withRouter(ThankyouPage)}
              />
              <PrivateRoute
                exact
                path="/buyingwindowlist"
                component={BuyingWindowList}
              />
              <PrivateRoute exact path="/wishlist" component={WishlistPage} />
              <PrivateRoute
                exact
                path="/NotificationList"
                component={NotificationList}
              />
              <PrivateRoute
                exact
                path="/certificatedataextraction"
                component={CertificateDataExtraction}
              />
              <PrivateRoute
                exact
                path="/product-edit"
                component={ProductDetailsEdit}
              />
              <PrivateRoute
                exact
                path="/product-edit1"
                component={withRouter(ProductDetailsEdit1)}
              />
              <PrivateRoute exact path="/myaccount" component={MyAccount} isCheckedToken={false}/>
              <PrivateRoute
                exact
                path="/category-management"
                component={CategoryManagement}
              />
              <PrivateRoute
                exact
                path="/commodity-management"
                component={CommodityManagement}
              />
              <PrivateRoute
                exact
                path="/global-settings"
                component={withRouter(GlobalSettings)}
              />
              <Route
                exact
                path="/registration-poc"
                component={Registration_copy}
              />
              <PrivateRoute
                exact
                path="/Registration-Controls"
                component={AddRegistrationcontrols}
              />
              <PrivateRoute
                exact
                path="/isoframework"
                component={SocialGovernQues}
              />
              <PrivateRoute exact path="/rfqlisting" component={RfqListing} />
              <PrivateRoute exact path="/create-rfq" component={CreateRfq} />
              <PrivateRoute exact path="/edit-rfq" component={EditRfq} />
              <PrivateRoute exact path="/buyer-rfq" component={BuyerRfq} />
              <PrivateRoute exact path="/bank-details" component={BankDetails} />
              <PrivateRoute
                exact
                path="/chirataepowerbI"
                component={ChirataePowerBI}
              />
              <PrivateRoute
                exact
                path="/upload-certificates"
                component={CompanyDocuments}
              />
              <PrivateRoute
                exact
                path="/onboarding-account"
                component={AccountOnboarding}
              />
              <PrivateRoute
                exact
                path="/companyListing"
                component={CompanyListing}
              />
              <PrivateRoute exact path="/questionnaires" component={Questionnaires} />

              <PrivateRoute
                exact
                path="/document-repository"
                component={DocumentRepositoryPage}
              />
              
              { 
                localStorage.getItem("isDiamlersupplier")!==undefined && 
                localStorage.getItem("isDiamlersupplier")!==null && 
                localStorage.getItem("isDiamlersupplier")!=="null" && 
                localStorage.getItem("isDiamlersupplier") === "true" ?
                  <Route
                    exact
                    path="/Assessments"
                    component={withRouter(AssessmentsLock)}
                  />:<PrivateRoute
                    exact
                    path="/assessments"
                    component={withRouter(Assessments)}
                  />
                }
                { 
                  localStorage.getItem("isDiamlersupplier")!==undefined && 
                  localStorage.getItem("isDiamlersupplier")!==null && 
                  localStorage.getItem("isDiamlersupplier")!=="null" && 
                  localStorage.getItem("isDiamlersupplier") === "true" ?
                  <Route
                    exact
                    path="/reports"
                    component={withRouter(AssessmentsLock)}
                  />:
                  <PrivateRoute
                    exact
                    path="/reports"
                    component={withRouter(Assessments)}
                  />
                }

              <PrivateRoute
                exact
                path="/ai-statistics/:warpInvitationId/:assessmentFormName/:comapnyName"
                component={AIStatistics}
                history={history}
              />
              <PrivateRoute
                exact
                path="/AssessmentIntroDetails/scoring_test/:warpInvitationId/:stepName"
                history={history}
                component={withRouter(AssessmentIntroDetails)}
              />
              <PrivateRoute
                exact
                path="/assessmentDetails/scoring_test/:warpInvitationId/:stepName"
                history={history}
                component={withRouter(AssessmentDetails)}
              />

              <PrivateRoute
                exact
                path="/import-partner"
                component={importPartner}
              />
              <PrivateRoute
                exact
                path="/AssessmentRecommendationDetails/scoring_test/:warpInvitationId/:stepName"
                history={history}
                component={withRouter(AssessmentRecommendDetails)}
              />
              <Route exact path="/ssologinfailed" component={ssologinfailed} />
              <PrivateRoute exact path="/preferences" component={Preferences} />
              <PrivateRoute
                exact
                path="/listing-page1"
                component={withRouter(ProductListingPage1)}
              />
              <OPPrivateRoute exact path="/ghgactivity" component={GHGActivity} />
              <OPPrivateRoute exact path="/verify-extracted-data" component={AIVerifyExtractedData} />
              <PrivateRoute
               exact
               path="/chat-with-snowkap-ai"
               component={ChatWithSnowkapAI}/>
              <OPPrivateRoute
                exact
                path="/monthly-activity-data"
                component={MonthlyActivityData}
              />
              <OPPrivateRoute
                exact
                path="/ghg/activity/grid-power"
                component={EnergyGridManualEntryActivityData}
              />
                       <OPPrivateRoute
    exact
    path="/ghg/activity/waste"
    component={WasteManualEntryActivityData}
/>

               <OPPrivateRoute
                exact
                path="/ghg/activity/captive-power"
                component={CaptivePowerManualEntryActivityData}
              />
               <OPPrivateRoute
                  exact
                  path="/ghg/activity/waste"
                  component={WasteManualEntryActivityData}
                />
                <OPPrivateRoute
                  exact
                  path="/ghg/activity/captive-power"
                  component={CaptivePowerManualEntryActivityData}
                />
                <OPPrivateRoute
                  exact
                  path="/ghg/activity/fuel-consumption"
                  component={FuelConsumptionManualEntryActivityData}
                />
                <OPPrivateRoute
                  exact
                  path="/goal-settings"
                  component={GoalSetting}
                />
                <PrivateRoute exact path="/ghgdashboard" component={GHGDashboard} />
                <PrivateRoute exact path="/atherdashboard" component={AtherDashboard} />
                <PrivateRoute exact path="/social-governance-dashboard" component={HealthSafetyDashboard} />
                <OPPrivateRoute
                  path="/enterprise-setup"
                  component={EnterpriseLayout}
                />
                <OPPrivateRoute
                  path="/data-upload-logs"
                  component={DataUploadLogSummaryLayout}
                />
                <OPPrivateRoute
                  path="/supplier-management"
                  component={SupplierMasterListingTable}
                />
                <OPPrivateRoute
                  exact
                  path="/user-activity-mapping"
                  component={UserActivityMapping}
                />
                <OPPrivateRoute
                  exact
                  path="/user-listing"
                  component={UserListingTable}
                />
                <OPPrivateRoute
                  exact
                  path="/location-listing"
                  component={LocationListingTable}
                />
                <OPPrivateRoute
                  exact
                  path="/add-users"
                  component={AddUsers}
                />
                <OPPrivateRoute
                  exact
                  path="/add-locations"
                  component={AddLocations}
                />
                <OPPrivateRoute
                  exact
                  path="/manage-uom-conversion-factors"
                  component={ManageUomConversionFactors}
                />
                <OPPrivateRoute
                  exact
                  path="/manage-carbon-emission-factors"
                  component={ManageCarbonEmissionFactors}
                />
                <PrivateRoute
                  exact
                  path="/procuredashboard"
                  component={ProcurementDashboard}
                />
                <PrivateRoute exact path="/ekycreport" component={EKYCReport} />
                <PrivateRoute
                  exact
                  path="/predealesgreport"
                  component={PredealESGReport}
                />
                <PrivateRoute
                  exact
                  path="/postdealesgreport"
                  component={PostdealESGReport}
                />
                <Route exact path="/dbmonitoring" component={dbMonitoring} />
                <Route
                  exact
                  path="/internalassessmentreport"
                  component={KhaitanESGReport}
                />
                {/* <Route
            exact
            path="/NewsletterUnsubscription"
            component={NewsletterUnsubscription}
          />
          {/* <Route exact path="/supplierlogin" component={Login} /> */}
          <Route exact path="/supplierlogin" component={SingleLogin} />
          <Route exact path="/registration" component={Registration} />
          <Route
            exact
            path="/artificialpunchout"
            component={ArtificialPunchout}
          />
          <Route exact path="/login" component={SingleLogin} />
          <Route exact path="/verification" component={Verification} />
          <Route exact path="/shop" component={Shop} />
          <Route exact path="/setnewpassword" component={SingleLogin} />
          <Route
            exact
            path="/supplierOnBoarding"
            component={SupplierOnBoardingNew}
          />
          <Route
            exact
            path="/companyOnBoarding"
            component={SupplierOnBoardingNew}
          />
          {/* <Route exact path="/snowkapteamlogin" component={SnowKapTeamLogin} /> */}
          <Route exact path="/snowkapteamlogin" component={SingleLogin} />
          {/* <PrivateRoute
            exact
            path="/predealesgreport"
            // component={PredealESGReport}
            component={PredealESGReportPowerBI}
          /> */}

              <PrivateRoute exact path="/pwcframework" component={QuetionsAns} />
              <PrivateRoute
                exact
                path="/portfolioesgreport"
                component={ESGReport}
              />
              <PrivateRoute exact path="/home" component={Dashboard} isCheckedToken={false}/>
              <PrivateRoute
                exact
                path="/listing-page"
                component={withRouter(ProductListingPage)}
              />
              <PrivateRoute
                exact
                path="/import-products"
                component={ImportExportProducts}
              />
              <PrivateRoute exact path="/add-product" component={AddProduct} />
              <PrivateRoute
                exact
                path="/supplier-listing"
                component={SupplierDetailsListing}
              />
              <PrivateRoute exact path="/prlisting" component={PRListingView} />
              <PrivateRoute exact path="/polisting" component={POListingView} />
              <PrivateRoute
                exact
                path="/prlistingforsqldemo"
                component={PRListingForSqlDemo}
              />
              <PrivateRoute
                exact
                path="/product-details"
                component={withRouter(ProductDetails)}
              />
              <PrivateRoute exact path="/logout" component={Logout} />
              <PrivateRoute
                exact
                path="/product-basket"
                component={withRouter(ProductBasket)}
              />
              <PrivateRoute
                exact
                path="/order-details"
                component={withRouter(OrderDetails)}
              />
              <PrivateRoute
                exact
                path="/thankyou"
                component={withRouter(ThankyouPage)}
              />
              <PrivateRoute
                exact
                path="/buyingwindowlist"
                component={BuyingWindowList}
              />
              <PrivateRoute exact path="/wishlist" component={WishlistPage} />
              <PrivateRoute
                exact
                path="/NotificationList"
                component={NotificationList}
              />
              <PrivateRoute
                exact
                path="/certificatedataextraction"
                component={CertificateDataExtraction}
              />
              <PrivateRoute
                exact
                path="/product-edit"
                component={ProductDetailsEdit}
              />
              <PrivateRoute
                exact
                path="/product-edit1"
                component={withRouter(ProductDetailsEdit1)}
              />
              <PrivateRoute exact path="/myaccount" component={MyAccount} isCheckedToken={false}/>
              <PrivateRoute
                exact
                path="/category-management"
                component={CategoryManagement}
              />
              <PrivateRoute
                exact
                path="/commodity-management"
                component={CommodityManagement}
              />
              <PrivateRoute
                exact
                path="/global-settings"
                component={withRouter(GlobalSettings)}
              />
              <Route
                exact
                path="/registration-poc"
                component={Registration_copy}
              />
              <PrivateRoute
                exact
                path="/Registration-Controls"
                component={AddRegistrationcontrols}
              />
              <PrivateRoute
                exact
                path="/isoframework"
                component={SocialGovernQues}
              />
              <PrivateRoute exact path="/rfqlisting" component={RfqListing} />
              <PrivateRoute exact path="/create-rfq" component={CreateRfq} />
              <PrivateRoute exact path="/edit-rfq" component={EditRfq} />
              <PrivateRoute exact path="/buyer-rfq" component={BuyerRfq} />
              <PrivateRoute exact path="/bank-details" component={BankDetails} />
              <PrivateRoute
                exact
                path="/chirataepowerbI"
                component={ChirataePowerBI}
              />
              <PrivateRoute
                exact
                path="/upload-certificates"
                component={CompanyDocuments}
              />
              <PrivateRoute
                exact
                path="/onboarding-account"
                component={AccountOnboarding}
              />
              <PrivateRoute
                exact
                path="/companyListing"
                component={CompanyListing}
              />
              <PrivateRoute exact path="/questionnaires" component={Questionnaires} />

              <PrivateRoute
                exact
                path="/document-repository"
                component={DocumentRepositoryPage}
              />
              
              { 
                localStorage.getItem("isDiamlersupplier")!==undefined && 
                localStorage.getItem("isDiamlersupplier")!==null && 
                localStorage.getItem("isDiamlersupplier")!=="null" && 
                localStorage.getItem("isDiamlersupplier") === "true" ?
                  <Route
                    exact
                    path="/Assessments"
                    component={withRouter(AssessmentsLock)}
                  />:<PrivateRoute
                    exact
                    path="/assessments"
                    component={withRouter(Assessments)}
                  />
                }
                { 
                  localStorage.getItem("isDiamlersupplier")!==undefined && 
                  localStorage.getItem("isDiamlersupplier")!==null && 
                  localStorage.getItem("isDiamlersupplier")!=="null" && 
                  localStorage.getItem("isDiamlersupplier") === "true" ?
                  <Route
                    exact
                    path="/reports"
                    component={withRouter(AssessmentsLock)}
                  />:
                  <PrivateRoute
                    exact
                    path="/reports"
                    component={withRouter(Assessments)}
                  />
                }

              <PrivateRoute
                exact
                path="/ai-statistics/:warpInvitationId/:assessmentFormName/:comapnyName"
                component={AIStatistics}
                history={history}
              />
              <PrivateRoute
                exact
                path="/AssessmentIntroDetails/scoring_test/:warpInvitationId/:stepName"
                history={history}
                component={withRouter(AssessmentIntroDetails)}
              />
              <PrivateRoute
                exact
                path="/assessmentDetails/scoring_test/:warpInvitationId/:stepName"
                history={history}
                component={withRouter(AssessmentDetails)}
              />

              <PrivateRoute
                exact
                path="/import-partner"
                component={importPartner}
              />
              <PrivateRoute
                exact
                path="/AssessmentRecommendationDetails/scoring_test/:warpInvitationId/:stepName"
                history={history}
                component={withRouter(AssessmentRecommendDetails)}
              />
              <Route exact path="/ssologinfailed" component={ssologinfailed} />
              <PrivateRoute exact path="/preferences" component={Preferences} />
              <PrivateRoute
                exact
                path="/listing-page1"
                component={withRouter(ProductListingPage1)}
              />
              <OPPrivateRoute exact path="/ghgactivity" component={GHGActivity} />
              <OPPrivateRoute exact path="/verify-extracted-data" component={AIVerifyExtractedData} />
              <PrivateRoute
               exact
               path="/chat-with-snowkap-ai"
               component={ChatWithSnowkapAI}/>
              <OPPrivateRoute
                exact
                path="/monthly-activity-data"
                component={MonthlyActivityData}
              />
              <OPPrivateRoute
                exact
                path="/ghg/activity/grid-power"
                component={EnergyGridManualEntryActivityData}
              />
                       <OPPrivateRoute
    exact
    path="/ghg/activity/waste"
    component={WasteManualEntryActivityData}
/>

               <OPPrivateRoute
                exact
                path="/ghg/activity/captive-power"
                component={CaptivePowerManualEntryActivityData}
              />
               <OPPrivateRoute
            exact
            path="/ghg/activity/fuel-consumption"
            component={FuelConsumptionManualEntryActivityData}
          />
              <PrivateRoute exact path="/ghgdashboard" component={GHGDashboard} />
              <PrivateRoute exact path="/ekycreport" component={EKYCReport} />
              <PrivateRoute exact path="/ekycreport" component={EKYCReport} />
              <PrivateRoute exact path="/esgreport" component={ESGReportToggle} />
              <PrivateRoute
                exact
                path="/bankingreport"
                component={BankingReport}
              />
              <PrivateRoute
                exact
                path="/materiality-dashboard"
                component={AtherDashboard}
              />
              <OPPrivateRoute
                exact
                path="/ghg-dashboard"
                component={PowerBiReportsDashboardOps}
              />
              <OPPrivateRoute
                exact
                path="/corporate-dashboard-old"
                component={PowerBiCorporateDashboardOpsOld}
              />
              <OPPrivateRoute
                exact
                path="/corporate-dashboard"
                component={OPPowerBiCorporateDashboard}
              />
              <OPPrivateRoute
                exact
                path="/corporate-dashboard-anthem"
                component={PowerBiCorporateDashboardOpsAnthem}
              />
              <PrivateRoute
                exact
                path="/predealesgreportnew"
                component={PredealESGReportNew}
              />
              <PrivateRoute
                exact
                path="/postdealesgreport"
                component={PostdealESGReport}
              />
              <OPPrivateRoute
                exact
                path="/ghgemissiondashboard"
                component={GHGDashboardOPs}
              />
              <OPPrivateRoute
                exact
                path="/environmental-dashboard"
                component={PowerDashboardOps}
              />
              <PrivateRoute
                exact
                path="/internalassessmentreport"
                component={KhaitanESGReport}
              />
              <PrivateRoute
                exact
                path="/standardimpactdashboard"
                component={Chirataereport}
              />
              <PrivateRoute
                exact
                path="/customimpactdashboardreport"
                component={CustomImpactToggle}
              />
              <PrivateRoute
                exact
                path="/esginvesteequestionnaireannual"
                component={ChirataeESGInvesteeQuestionnaireAnnual}
              />
              <PrivateRoute
                exact
                path="/assessmentsonetime"
                component={AssessmentsOneTime}
              />
              <PrivateRoute
                exact
                path="/assessmentsonetime/scoring_test/:opsInvitationId/:stepName"
                history={history}
                component={withRouter(AssessmentDetailsOneTime)}
              />
              <PrivateRoute
                exact
                path="/assessmentsmonthly"
                component={AssessmentsMonthly}
              />
              <PrivateRoute
                exact
                path="/assessmentsmonthly/scoring_test/:opsInvitationId/:stepName"
                history={history}
                component={withRouter(AssessmentDetailsMonthly)}
              />
              <PrivateRoute
                exact
                path="/assessmentrecommendation/:InvitationId/:questionnare/:period/:comapnyName/:deviationCount/:isCarryForward/:submissionID/:score/:firstName"
                history={history}
                component={withRouter(AssessmentRecommendation)}
              />
              <PrivateRoute
                exact
                path="/logistics-dashboard"
                component={LogisticDashboard}
              />
              <PrivateRoute
                exact
                path="/client-logistics-dashboard"
                component={LogisticClientDashboard}
              />
              <OPPrivateRoute exact path="/goal-settings" component={GoalSetting} />
              <OPPrivateRoute
                path="/enterprise-setup"
                component={EnterpriseLayout}
              />
              <OPPrivateRoute
                path="/supplier-material-mapping"
                component={SupplierMaterialMapping}
              />
              <OPPrivateRoute
                exact
                path="/user-activity-mapping"
                component={UserActivityMapping}
              />
              <OPPrivateRoute
                exact
                path="/user-listing"
                component={UserListingTable}
              />
              <OPPrivateRoute
                exact
                path="/location-listing"
                component={LocationListingTable}
              />
                <OPPrivateRoute
                exact
                path="/suppliertracker"
                component={SupplierTracker}
              />
              <OPPrivateRoute exact path="/add-users" component={AddUsers} />
              <OPPrivateRoute
                exact
                path="/add-locations"
                component={AddLocations}
              />
              <OPPrivateRoute
            exact
            path="/manage-carbon-emission-factors"
            component={ManageCarbonEmissionFactors}
          />
              <OPPrivateRoute
            exact
            path="/manage-uom-conversion-factors"
            component={ManageUomConversionFactors}
          />
              {/* Handle authenticated 404s */}
              <Route
                render={() =>
                  localStorage.getItem("IsAuthentic") === "true" ? (
                    <NotFound />
                  ) : (
                    <Redirect to="/" />
                  )
                }
              />
            </Switch>
          </Layout>
        </Route>
      </Switch>
    </PlatformSessionMonitor>
  );
};

export default app;
