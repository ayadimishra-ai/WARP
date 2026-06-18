import React, { useState } from "react";
import Button from "../Material/CustomButtons/Button";
import { CircularProgress } from "@material-ui/core";
import { popupAlert } from "../../UI/Popups/popup";
import axios from "axios";
import jwt from "jsonwebtoken";
import XLSX from "xlsx/dist/xlsx.full.min.js";
import { GetGHGEstimationUrl, getServiceUrl } from "../../config";
const FileSaver = require("file-saver");

const DownloadEmissionFactors = () => {
  const [buttonLoader, setButtonLoader] = useState(false);

  const getOrganizationName = async() => {
    let organizationName = "";
    const config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        UserGuid: localStorage.userId,
        CompanyGuid: localStorage.companyGuid,
        LanguageGuid: localStorage.languageId,
      },
    };
    const response = await axios.get(
      getServiceUrl() + "Users/GetUserAccountDetails",
      config
    );
    if (
      response &&
      response.data &&
      response.data.table1 &&
      response.data.table1[0] &&
      response.data.table1[0].organization
    ) {
      organizationName = response.data.table1[0].organization;
    }
    return organizationName
  };

  const fetchEmissionFactorData = async() => {
    setButtonLoader(true);
    const organizationName = await getOrganizationName();
    const decodedToken = jwt.decode(localStorage.opsToken);
    const formData = {
      organization_id:
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
        GetGHGEstimationUrl() + "api/v1/emission-factor/get-emission-factor",
        formData,
        opConfig
      )
      .then((response) => {
        const EmissionFactor = response.data.data;
        const ws =
          EmissionFactor.length > 0
            ? XLSX.utils.json_to_sheet(EmissionFactor)
            : XLSX.utils.aoa_to_sheet([["No Data Found"]]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Emission Factors");

        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

        const excelBlob = new Blob([excelBuffer], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        
        const filename = `Emission_Factors_${organizationName}_${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`;

        FileSaver.saveAs(excelBlob, filename);
      })
      .catch((error) => {
        popupAlert("error", "Error", "Something went wrong.");
        console.log("error", error);
      })
      .finally(() => setButtonLoader(false));
  };
  return (
    <></>
    // <Button
    //   className={"secondarydBtn"}
    //   type="button"
    //   style={{
    //     margin: 0,
    //   }}
    //   onClick={fetchEmissionFactorData}
    // >
    //   Download Emission Factors
    //   {buttonLoader && (
    //     <CircularProgress
    //       color="inherit"
    //       size={18}
    //       style={{ marginLeft: 12 }}
    //     />
    //   )}
    // </Button>
  );
};

export default DownloadEmissionFactors;
