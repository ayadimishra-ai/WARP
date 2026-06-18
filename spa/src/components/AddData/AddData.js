import React, { Component } from "react";
import { popupAlert } from "../../UI/Popups/popup";
import BulkUploadDropdown from "../BulkUploadBtn&DownloadTemplateDropdown/BulkUploadDropdown";
import DownloadTemplateDropdown from "../BulkUploadBtn&DownloadTemplateDropdown/DownloadTemplateDropdown";
import { decodeOpAccessToken } from "../../utility";

class AddData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jwtToken: "",
    };
  }

  componentDidMount() {
    this.setState({ jwtToken: localStorage.opsToken }, () => {
      try {
        const decodedToken = decodeOpAccessToken(this.state.jwtToken);
        if (decodedToken) {
          const organizationId =
            decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
          this.setState({ organizationId: organizationId });
        }
      } catch (error) {
        // Handle token decoding errors if necessary
        console.error("Error decoding token:", error);
      }
    });
  }
  ytModalHandler = () => {
    popupAlert("commonModal", this.props.popupTitle, this.props.popupContent);
  };
  render() {
    return (
      <div className="add_data_container">
        <img src={this.props.pageIcon} />
        <h2>{this.props.pageTitle}</h2>
        <p>{this.props.pageContent}</p>
        <div className="add_data_container_btn">
          <BulkUploadDropdown
            isIcon={true}
            submitDataHandle={this.props.submitDataHandle}
          />
          <DownloadTemplateDropdown isIcon={true} />
        </div>
        {/* <div
          onClick={this.ytModalHandler}
          className="youtubeTut cursor-pointer"
        >
          <PlayCircleFilled />
          <p>Video tutorial on how to add data</p>
        </div> */}
      </div>
    );
  }
}
export default AddData;
