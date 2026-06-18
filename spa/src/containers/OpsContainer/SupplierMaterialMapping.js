import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { decodeOpAccessToken } from "../../utility";
import { GetGHGEstimationUrl } from "../../config";
import { popupAlert } from "../../UI/Popups/popup";
import { withStyles } from "@material-ui/core/styles";
import {
  MESSAGE_BULK_UPLOAD_SUPPLIER_MATERIAL_MAPPING,
  MESSAGE_CONFIRM_DELETE_SUPPLIER_MATERIAL_MAPPING,
  MESSAGE_SUPPLIER_MATERIAL_MAPPING_DATA_CHANGED,
} from "../../ops/message-constant";
import BulkUploadSupplierMaterialMapping from "./supplier-material-mapping/BulkUploadSupplierMaterialMapping";

let messageData = "";

const styles = () => ({
  root: {
    display: "flex",
  },
});

class SupplierMaterialMapping extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jwtToken: "",
      organizationId: "",
      pendingDeleteMappingId: null,
      isBulkUploadPopupOpen: false,
    };
  }

  componentDidMount = async () => {
    this.setState({ jwtToken: localStorage.opsToken });
    try {
      const decodedToken = decodeOpAccessToken(localStorage.opsToken);
      const organizationId =
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
      localStorage.setItem("opsUserCompanyId", organizationId);
      this.setState({ organizationId: organizationId });
    } catch (error) {
      this.setState({ organizationId: null });
    }
    this.newHandle();
  };

  newHandle = () => {
    window.addEventListener("message", async (event) => {
      event.preventDefault();
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = "";
          messageData = event.data ? JSON.parse(event.data) : "";
          console.log("Received message:", messageData);
          const type = messageData.type;
          switch (type) {
            case MESSAGE_CONFIRM_DELETE_SUPPLIER_MATERIAL_MAPPING:
              this.setState({
                pendingDeleteMappingId: messageData.data.mappingId,
              });
              popupAlert(
                "deleteConfirmWarpPopupRedButton",
                "Delete Mapping",
                `Are you sure you want to delete the mapping for "${messageData.data.supplierName}" - "${messageData.data.materialName}" (${messageData.data.fromPeriod} to ${messageData.data.toPeriod})? This action cannot be undone.`,
                () => {
                  const listingIframe = document.getElementById(
                    "supplierMaterialMappingListing"
                  );
                  if (listingIframe && listingIframe.contentWindow) {
                    listingIframe.contentWindow.postMessage(
                      JSON.stringify({
                        type: "confirm-delete-response",
                        data: {
                          confirmed: true,
                          mappingId: this.state.pendingDeleteMappingId,
                        },
                      }),
                      "*"
                    );
                  }
                  this.setState({ pendingDeleteMappingId: null });
                },
                "CANCEL",
                "YES, DELETE",
                () => {
                  this.setState({ pendingDeleteMappingId: null });
                }
              );
              break;
            case MESSAGE_BULK_UPLOAD_SUPPLIER_MATERIAL_MAPPING:
              this.showBulkUploadPopup();
              break;
            case MESSAGE_SUPPLIER_MATERIAL_MAPPING_DATA_CHANGED:
              if (!messageData.isFailed) {
                popupAlert("success", "Success", "Mapping saved successfully.");
              } else {
                popupAlert("error", "Error", "Something went wrong.");
              }
              break;
            default:
              break;
          }
        } catch (error) {
          console.error(`Error in ${messageData.type}: `, error);
        }
      }
    });
  };

  showBulkUploadPopup = () => {
    this.setState({ isBulkUploadPopupOpen: true });
  };

  hideBulkUploadPopup = () => {
    this.setState({ isBulkUploadPopupOpen: false });
  };

  render() {
    const { isBulkUploadPopupOpen } = this.state;

    return (
      <React.Fragment>
        <iframe
          title="Supplier Material Mapping"
          id="supplierMaterialMappingListing"
          src={
            GetGHGEstimationUrl() +
            localStorage.opsUserCompanyId +
            "/embed/v1/" +
            localStorage.opsToken +
            "/supplier-material-mapping"
          }
          style={{ width: "100%", height: "100vh", border: "none" }}
        />
        {isBulkUploadPopupOpen ? (
          <BulkUploadSupplierMaterialMapping
            hideBulkUploadPopup={this.hideBulkUploadPopup}
          />
        ) : null}
      </React.Fragment>
    );
  }
}

export default withRouter(withStyles(styles)(SupplierMaterialMapping));