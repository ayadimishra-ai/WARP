import React, { Component } from "react";
import axios from "axios";
import { getServiceUrl, getCPanelURL } from "../../config";
import * as RoleCodes from "../../rolecodes";
//import MeasureListingIndex from "@yagnitechdev/measure-listing/dist/index";

const cPanelUrl = getCPanelURL();

class DataMeasureListing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authGenerated: false,
    };
  }

  /// <summary>
  /// Author  :   ShriGanesh Singh
  /// Date    :   13th July 2021
  /// </summary>
  // async GetAuthToken() {
  //   var config = {
  //     headers: {
  //       Authorization: "Bearer " + localStorage.tokenId,
  //       "Content-Type": "application/json",
  //       emailId: localStorage.emailId,
  //     },
  //   };
  //   await axios
  //     .get(getServiceUrl() + "Integration/GetAuthToken", config)
  //     .then((json) => {
  //       localStorage.setItem("auth", json.data);
  //       this.setState({ authGenerated: true });
  //     })
  //     .catch((err) =>
  //       err.response !== undefined
  //         ? err.response.status === 401
  //           ? (window.location.pathname = "/logout")
  //           : ""
  //         : ""
  //     );
  // }

  async componentDidMount() {
    if (
      localStorage.getItem("IsAuthentic") === "true" ||
      localStorage.getItem("IsAuthentic") === true
    ) {
      if (
        localStorage.userType !== undefined &&
        localStorage.userType !== null
      ) {
        if (localStorage.userType !== "null") {
          if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER) {
            //await this.GetAuthToken();
            this.setState({ authGenerated: true });
          }
        }
      }
    }
  }

  render() {    
    let measureListingForm = null;
    if (this.state.authGenerated) {       
            measureListingForm = <div></div>        
    }
    else
    {
      measureListingForm =  <div id="no_prod_listing_page" className="no-products-found">  
      <h4>Oops! Your Account is not Approved to access this page.</h4>     
    </div>
    }
    return measureListingForm;
  }
}

export default DataMeasureListing;
