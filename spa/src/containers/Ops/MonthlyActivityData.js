import React, { Component } from "react";
import { BreadCrumb, MaterialProcurementActivityBlock } from "../../utility";
import AddData from "../../components/AddData/AddData";
import Add_data_page_icon from "../../assets/img/add_data_page_icon.svg";
import { popupAlert } from "../../UI/Popups/popup";
import {
  GetGHGEstimationUrl,
  getServiceUrl,
  getWebsiteUrl,
} from "../../config";
import axios from "axios";
import jwt from "jsonwebtoken";
import BulkUploadDropdown from "../../components/BulkUploadBtn&DownloadTemplateDropdown/BulkUploadDropdown";
import DownloadTemplateDropdown from "../../components/BulkUploadBtn&DownloadTemplateDropdown/DownloadTemplateDropdown";
import Button from "../../components/Material/CustomButtons/Button";
import { Link } from "react-router-dom";
import Spinner from "../../UI/Spinner/Spinner";
import * as RoleCodes from "../../rolecodes";


const excludeArray = [
  "production",
  "transport_downstream",
  "transport_employee_travel",
  "transport_business_travel",
  "general",
  "transport_upstream",
  "material_procurement"
];
class MonthlyActivityData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      jwtToken: "",
      activityLocations: "",
      bulkData: [],
      BulkUploadActivity: null,
      monthlyActivityData: [],
      activities: [],
      mappings:[],
      orgRole:'BUYER'
    };
  }

  getBuyerShareURL = () => {
    let file = "";
    switch (localStorage.opsUserBuyerShareMethod) {
      case "by_volume":
        file = getWebsiteUrl() + "ops/MonthlyBuyerShareAllocationByVolume.xlsx";
        break;
      case "by_revenue":
        file =
          getWebsiteUrl() + "ops/MonthlyBuyerShareAllocationByRevenue.xlsx";
        break;
      case "by_number_of_units":
        file = getWebsiteUrl() + "ops/MonthlyBuyerShareAllocationByUnits.xlsx";
        break;
      default:
        file = getWebsiteUrl() + "ops/MonthlyBuyerShareAllocationByMass.xlsx";
        break;
    }
    return file;
  };
  fetchMonthlyActivityData = () => {
    const decodedToken = jwt.decode(this.state.jwtToken);
    const formData = {
      organizationId:
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"],
    };
    const opConfig = {
      headers: {
        "x-sk-op-authorization": localStorage.opsToken,
        "Content-Type": "application/json",
      },
    };
    axios
      .post(
        GetGHGEstimationUrl() + "api/v1/monthly-activity-data",
        formData,
        opConfig
      )
      .then((response) => {
        this.setState({
          monthlyActivityData: response.data.data,
          loader: false,
        });
      })
      .catch(() => this.setState({ loader: false }));
  }
  getOrganizationRole = async () => {
    try {
      const decodedToken = jwt.decode(localStorage.opsToken);
      const formData = {
        organizationId:
          decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"],
       };
  
      const opConfig = {
        headers: {
          "x-sk-op-authorization": localStorage.opsToken,
          "Content-Type": "application/json",
        },
      };
  
      const response = await axios.post(
        GetGHGEstimationUrl() + "api/v1/users/buyer-supplier-role",
        formData,
        opConfig
      );
      this.setState({
        orgRole: response.data.data,
      });
  
    } catch (error) {
      console.error("Error in getAddressActivityMapping:", error);
      this.setState({ loader: false }); // Handle errors and stop the loader
    }
  };
  getDownloadLink=(activity)=>
  {
    switch (activity) {
      case "general": {
        return getWebsiteUrl() + "ops/GeneralDetails.xlsx";
      }
      case "energy_grid_power": {
        return getWebsiteUrl() + "ops/GridPower.xlsx";
      }
      case "energy_captive_power": {
        return getWebsiteUrl() + "ops/CaptivePower.xlsx";
      }
      case "energy_fuel_purchased": {
        return getWebsiteUrl() + "ops/FuelPurchased.xlsx";
      }
      case "transport_employee_travel": {
        return getWebsiteUrl() + "ops/EmployeeTravel.xlsx";
      }
      case "transport_business_travel": {
        return getWebsiteUrl() + "ops/BusinessTravel.xlsx";
      }
      case "waste": {
        return getWebsiteUrl() + "ops/WasteDataTracking.xlsx";
      }
      case "transport_upstream": {
        return getWebsiteUrl() + "ops/Upstream.xlsx";
      }
      case "transport_downstream": {
        return getWebsiteUrl() + "ops/Downstream.xlsx";
      }
      case "production": {
        return getWebsiteUrl() + "ops/Production.xlsx";
      }
      case "material_procurement": {
        return getWebsiteUrl() + "ops/MaterialProcurement.xlsx";
      }
      default: {
        return this.getBuyerShareURL();
      }
    }
  }
  getAddressActivityMapping = async () => {
    try {
      const decodedToken = jwt.decode(localStorage.opsToken);
      const formData = {
        organizationId:
          decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"],
        userId:
          decodedToken["https://hasura.io/jwt/claims"]["x-hasura-user-id"],
      };
  
      const opConfig = {
        headers: {
          "x-sk-op-authorization": localStorage.opsToken,
          "Content-Type": "application/json",
        },
      };
  
      const response = await axios.post(
        GetGHGEstimationUrl() + "api/v1/users/activity-permissions",
        formData,
        opConfig
      );
  const mappings = response.data.data.map((item) => {
        return {
          activities: item.sub_activities,
          organization_address_id: item.location_id,
        };
      });
  const activities = response.data.data[0].activities.map((item) => {
        if (item.Activity.Activities.length > 0) {
          // Return an array of innerItem maps
          return item.Activity.Activities.map((innerItem) => ({
            activity: innerItem.name,
            activityHeader: innerItem.name,
            activity_code: innerItem.code,
            section: item.Activity.code,
            downloadLink: this.getDownloadLink(innerItem.code), //this.getDownloadLink(item.Activity.code)
          }));
        } else {
          // Return a single object for the outer item
          return {
            activity: item.Activity.name,
            activityHeader: item.Activity.name,
            activity_code: item.Activity.code,
            section: item.Activity.code,
            downloadLink: this.getDownloadLink(item.Activity.code)
          };
        }
      });
  // Flatten the array if necessary
      const flatActivities = activities.flat();
      // Update state
      this.setState({
        activities: flatActivities,
        mappings: mappings,
      });
  
    } catch (error) {
      console.error("Error in getAddressActivityMapping:", error);
      this.setState({ loader: false }); // Handle errors and stop the loader
    }
  };
  
  componentDidMount = async () => {
    await this.getAddressActivityMapping(); // Ensure this gets awaited properly
    await this.getOrganizationRole(); // Ensure this gets awaited properly
    this.setState({ jwtToken: localStorage.opsToken }, () => {    
      const decodedToken = jwt.decode(this.state.jwtToken);
     
      const organizationId =
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
      localStorage.setItem("opsUserCompanyId", organizationId);
      this.setState({ organizationId: organizationId });
      const result = this.state.mappings.map((a) => {
        return [...new Set(a.activities)];
      });

      const organizationAddressIds = this.state.mappings.map((a) => {
        return a.organization_address_id;
      });

      const orgAddressIdsWithActivities = this.state.mappings.map((a) => {
        return {
          organizationAddressId: a.organization_address_id,
          activities: a.activities,
        };
      });

      const data = {
        OpsOrganizationAddressId: organizationAddressIds,
        UserGuid: localStorage.userId,
      };

      var config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "application/json",
        },
      };
      this.fetchMonthlyActivityData()
      axios
        .post(getServiceUrl() + "Ops/GetOrganizationAddress", data, config)
        .then((response) => {
          this.setState({ activityLocations: response.data });
        });

      const uniqueArray = result.flat().filter(function (item, pos) {
        return result.flat().indexOf(item) === pos;
      });
      const finalActivitiesArray = this.state.activities
      .filter((m) => uniqueArray.includes(m.section))
      .map(({ activity, downloadLink, activityHeader, activity_code, section }) => ({
        activity,
        downloadLink,
        activityHeader,
        activity_code,
        section            
      }));

      if(this.state.orgRole==="SUPPLIER")
        {
      const filteredArray = finalActivitiesArray.filter(
        item => !excludeArray.some(exclude => exclude === item.activity_code)
       );
       this.setState({
        bulkData: filteredArray,
        orgAddressIdsWithActivities: orgAddressIdsWithActivities,
      });
      }
      else
      {
        this.setState({
          bulkData: finalActivitiesArray,
          orgAddressIdsWithActivities: orgAddressIdsWithActivities,
        });
      }

      const formData = {
        organizationId:
          decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"],
      };
      const opConfig = {
        headers: {
          "x-sk-op-authorization": localStorage.opsToken,
          "Content-Type": "application/json",
        },
      };
      axios
        .post(
          GetGHGEstimationUrl() + "api/v1/org-buyersuppliermethod-data",
          formData,
          opConfig
        )
        .then((response) => {
          const dataType = response.data.data;
          localStorage.setItem("opsUserBuyerShareMethod", dataType);
        })
        .catch((err) => console.log("err", err));
    });

    window.addEventListener("message", this.handleMessage)
  };
  handleMessage = (event) => {
    event.preventDefault();
   
        if (event.data === "OpenBuyerShareDetails") {
        event.preventDefault();
          popupAlert(
            "commonModalWithActions",
            "Buyer's Share Details",
            <iframe
              id="buyerShareIframe"
              scrolling="yes"
              title="Buyer's Share Details"
              src={
                GetGHGEstimationUrl() +
                localStorage.opsUserCompanyId +
                "/embed/v1/" +
                localStorage.opsToken +
                "/buyer-share-details"
              }
              frameBorder="0"
              allowFullScreen
              style={{
                //height: "187px",
                width: "100%",
                padding: "0 25px 15px",
              }}
            />,
            () => {
              this.setState({
                BulkUploadActivity: this.state.bulkData.find(
                  (i) => i.activity == "Buyer Share"
                ),
              });
            },
            "Cancel",
            "Add Data"
          );
        } else if (event.data && event.data.contentHeight) {
          const iframe = document.getElementById("buyerShareIframe");
           if (iframe) {
           iframe.style.height = `${event.data.contentHeight + 40}px`;
      }}
  }
  handleBulkUploadActivity = () => this.setState({ BulkUploadActivity: null });
  componentWillUnmount = () => window.removeEventListener("message", this.handleMessage);
  render() {
    let breadCrumb = BreadCrumb([
      { pageName: "Home", url: "/Home" },
      { pageName: "Monthly Activity Data", url: "/#" },
    ]);
    return (
      <React.Fragment>
        <div className="breadtitle_wrap">
          {breadCrumb}
          <div className="page_top_title">
            <div
              className="page_heading"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                width: "100%",
              }}
            >
              <h4>Monthly Activity Data</h4>
              {(this.state.monthlyActivityData.length > 0 || JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) ? (
                <>
                  <div
                    className="breadCrumbActionButtons"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 15,
                      position:"relative",
                      top: "-10px"
                    }}
                  >
                    <Button
                      className={"secondarydBtn"}
                      type="button"
                      style={{
                        margin: 0,
                      }}
                    >
                      <Link to="ghgactivity">Data Update Logs</Link>
                    </Button>
                    {JSON.parse(localStorage.userType) !== RoleCodes.ORGANIZATIONADMIN ?
                      this.state.activities.length>0?
                        <React.Fragment>
                        <BulkUploadDropdown
                          BulkUploadActivity={this.state.BulkUploadActivity}
                          handleBulkUploadActivity={this.handleBulkUploadActivity}
                          isIcon={false}
                          activityLocations={this.state.activityLocations}
                          activities={this.state.activities}
                          bulkData={this.state.bulkData}
                          orgAddressIdsWithActivities={
                            this.state.orgAddressIdsWithActivities
                          }
                          submitDataHandle={() => document.getElementById('iframeDasboard').contentWindow.postMessage('callApi', new URL(GetGHGEstimationUrl()).origin)}
                        />
                        <DownloadTemplateDropdown
                          isIcon={false}
                          activityLocations={this.state.activityLocations}
                          bulkData={this.state.bulkData}
                          orgAddressIdsWithActivities={
                            this.state.orgAddressIdsWithActivities
                          }
                        />
                        </React.Fragment>: null
                         : ""}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <div className="">
          {this.state.loader ? (
            <div
              style={{
                display: "block",
                position: "absolute",
                width: "100%",
                height: "100vh",
                background: "rgba(255,255,255,.8)",
              }}
            >
              <Spinner />
            </div>
          ) : (
            <>
              {this.state.monthlyActivityData.length > 0 ||
                JSON.parse(localStorage.userType) ===
                RoleCodes.ORGANIZATIONADMIN ? (
                <iframe
                  scrolling="yes"
                  title="Dasboard"
                  id="iframeDasboard"
                  src={
                    GetGHGEstimationUrl() +
                    localStorage.opsUserCompanyId +
                    "/embed/v1/" +
                    localStorage.opsToken +
                    "/activity-data-records"
                  }
                  onLoad={() => this.setState({ loader: false })}
                  frameBorder="0"
                  width="100%"
                  allowFullScreen
                  style={{
                    height: "calc(100vh - 45px)",
                  }}
                />
              ) : (
                <AddData
                  submitDataHandle={this.fetchMonthlyActivityData}
                  activities={this.state.activities}
                  pageIcon={Add_data_page_icon}
                  orgRole={this.state.orgRole}
                  pageTitle={"Add Your Activity Data"}
                  pageContent={
                    <>
                      When you add monthly activity data you'll see them here.
                      Download our sample template to learn the information you
                      need to add for your activity data. <br />
                      Supported file formats: .csv or .xls.
                    </>
                  }
                  popupTitle={"How to add bulk data?"}
                  popupContent={
                    <iframe
                      width="100%"
                      height="415"
                      src="https://www.youtube.com/embed/GhblUfAVVHw?si=mHyAl0Iy_bjKF5FJ"
                      title="YouTube video player"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerpolicy="strict-origin-when-cross-origin"
                      allowfullscreen
                    />
                  }
                />
              )}
            </>
          )}
        </div>
      </React.Fragment>
    );
  }
}
export default MonthlyActivityData;
