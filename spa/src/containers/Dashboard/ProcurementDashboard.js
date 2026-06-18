//import React from "react";
import React, { Component } from "react";
import * as PageKeys from "../../pagekeys";
import { Redirect } from "react-router-dom";
import { getNextJSServiceUrl, getUserPermision } from "../../config";
import axios from "axios";
import { getServiceUrl } from "../../config";
import Spinner from "../../UI/Spinner/Spinner";

/*export default function App() {
    return (
        <div className="">
            <iframe
                scrolling="no"
                title="Dasboard"
                id="iframeDasboard"
                src="https://datastudio.google.com/embed/reporting/fe3c093b-15ac-433a-9c2a-04eef1a2b855/page/p_im24i6gmyc"
                //src="https://datastudio.google.com/embed/reporting/2e99301e-d342-4a4e-b135-3cc23826ec10/page/p_dgs54lgmyc"
                //src="https://datastudio.google.com/embed/reporting/d82334ad-5536-470e-bef1-58c10b8d5f32/page/V101C"
                // src="https://datastudio.google.com/embed/reporting/80102ff6-6ea6-4a5f-8dcc-ac12accf6414/page/EVOyC"
                frameBorder="0"
                style={{ width: '100%' }}
                height="1050"
                allowFullScreen
            />
        </div>
    );
}*/

class ProcurementDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dashboardUrls: "",
      loader: true,
      dashboardiFrameHeight: "",
      isBorder: false,
      isPowerBiReport: false,
    };
  }

  componentDidMount = async () => {
    this.getDashboardUrl();
  };

  async getDashboardUrl() {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        CompanyGuid: localStorage.companyGuid,
        DashboardType: "procurementdashboard",
      },
    };
    await axios
      .get(getNextJSServiceUrl() + "common/GetDashboardUrls", config)
      .then((json) => {
        this.setState({ loader: false });
        if (json.status === 200) {
          if (json.data !== undefined) {
            this.setState({
              dashboardUrls: json.data[0].url,
              isBorder: json.data[0].isBorder,
              isPowerBiReport: json.data[0].isPowerBiReport,
              dashboardiFrameHeight: json.data[0].dashboardHeight,
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
        this.setState({ loader: false });
      });
  }

  render() {
    let permissions =
      localStorage.permissions !== undefined
        ? JSON.parse(localStorage.permissions)
        : [];
    if (permissions.length === 0) {
      return <Redirect to="/home" />;
    } else if (
      getUserPermision(permissions, PageKeys.procurementdashboard) === null
    ) {
      return <Redirect to="/home" />;
    }
    return this.state.loader ? (
      <Spinner />
    ) : (
      <div className="">
        <iframe
          scrolling="no"
          title="Dasboard"
          id="iframeDasboard"
          src={this.state.dashboardUrls}
          //src="https://datastudio.google.com/embed/reporting/fe3c093b-15ac-433a-9c2a-04eef1a2b855/page/p_im24i6gmyc"
          //src="https://datastudio.google.com/embed/reporting/2e99301e-d342-4a4e-b135-3cc23826ec10/page/p_dgs54lgmyc"
          //src="https://datastudio.google.com/embed/reporting/d82334ad-5536-470e-bef1-58c10b8d5f32/page/V101C"
          // src="https://datastudio.google.com/embed/reporting/80102ff6-6ea6-4a5f-8dcc-ac12accf6414/page/EVOyC"
          frameBorder="0"
          style={{ width: "100%" }}
          height="1050"
          allowFullScreen
        />
      </div>
    );
  }
}
export default ProcurementDashboard;
