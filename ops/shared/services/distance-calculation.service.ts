import axios from "axios";
import { UUID } from "crypto";
import { getGraphQlServerSDK } from "~/graphql/server";
import { GlobalMasterKeys } from "~/lib/op-database/types";
import { sanitizeString } from "~/utils/sanitize.util";
import {
  TransportModes,
  TransportModesForAPI,
} from "../constants/input.constant";

export const calculateDistanceInKilometers = async (
  transport_mode: string,
  from_latitude: Number,
  from_longitude: Number,
  to_latitude: Number,
  to_longitude: Number,
  transit_mode: string,
  organization_id: UUID
) => {
  try {
    const sdk = await getGraphQlServerSDK();
    const configData = await sdk.getAppGlobalMasterDetailsByType({
      key: [
        GlobalMasterKeys?.GoogleMatrixApiKey,
        GlobalMasterKeys?.RapidApiKey,
      ],
    });
    if (
      transport_mode.toLocaleLowerCase() ===
        TransportModes.Road.toLocaleLowerCase() ||
      transport_mode.toLocaleLowerCase() ===
        TransportModes.Rail.toLocaleLowerCase()
    ) {
      const roadGlobalData = configData?.AppGlobalMaster.filter(
        (item) => item.key == GlobalMasterKeys?.GoogleMatrixApiKey
      );
      const transport_value = TransportModesForAPI.find(
        (item) =>
          sanitizeString.v1(item.name) === sanitizeString.v1(transport_mode)
      );
      let transit_mode_api = "";
      if (!!transport_value && !!transport_value.mode) {
        const mode_value = transport_value.mode.filter(
          (item) =>
            sanitizeString.v1(item.name) === sanitizeString.v1(transit_mode)
        );
        if (!!mode_value.length) {
          transit_mode_api = mode_value[0].value;
        }
      }
      let api_url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${from_latitude},${from_longitude}&destinations=${to_latitude},${to_longitude}&mode=${transport_value?.value}&key=${roadGlobalData[0]?.data?.value}`;
      if (!!transit_mode_api) {
        api_url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${from_latitude},${from_longitude}&destinations=${to_latitude},${to_longitude}&mode=${transport_value?.value}&transit_mode=${transit_mode_api}&key=${roadGlobalData[0]?.data?.value}`;
      }
      const response = await fetch(api_url);
      const data = await response.json();
      let distanceInMeters: number = 0;
      if (data.status === "OK") {
        if (!!transit_mode_api) {
          if (data?.rows[0]?.elements[0].status != "OK") {
            api_url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${from_latitude},${from_longitude}&destinations=${to_latitude},${to_longitude}&key=${roadGlobalData[0]?.data?.value}`;
            const response = await fetch(api_url);
            const data = await response.json();
            distanceInMeters = data?.rows[0]?.elements[0]?.distance?.value;
          } else {
            distanceInMeters = data?.rows[0]?.elements[0]?.distance?.value;
          }
        } else {
          distanceInMeters = data?.rows[0]?.elements[0]?.distance?.value;
        }
        return {
          message: "OK",
          data: Number((distanceInMeters / 1000).toFixed(2)),
          success: true,
        };
      } else {
        return {
          message: data.error_message,
          data: 0,
          success: false,
        };
      }
    } else if (
      transport_mode.toLocaleLowerCase() ===
        TransportModes.Air.toLocaleLowerCase() ||
      transport_mode.toLocaleLowerCase() ===
        TransportModes.Water.toLocaleLowerCase()
    ) {
      const otherThanRoadGlobalData = configData?.AppGlobalMaster.filter(
        (item) => item.key == GlobalMasterKeys?.RapidApiKey
      );
      const transport_value = TransportModesForAPI.find(
        (item) =>
          sanitizeString.v1(item.name) === sanitizeString.v1(transport_mode)
      );
      let mode_param = {};
      if (!!transport_value) {
        mode_param = transport_value.value;
      }
      const options = {
        method: "POST",
        url: "https://api.distance.tools/api/v2/distance/route",
        params: mode_param,
        headers: {
          "content-type": "application/json",
          "X-Billing-Token": otherThanRoadGlobalData[0]?.data?.value,
          Host: "api.distance.tools",
        },
        data: {
          route: [
            {
              name: from_latitude + "," + from_longitude,
            },
            {
              name: to_latitude + "," + to_longitude,
            },
          ],
        },
      };
      const response = await axios.request(options);
      if (response.statusText === "OK") {
        if (
          transport_mode.toLocaleLowerCase() ===
          TransportModes.Air.toLocaleLowerCase()
        )
          return {
            message: "OK",
            data: Number(
              response?.data?.steps[0]?.distance?.vincenty?.toFixed(2)
            ),
            success: true,
          };
        else
          return {
            message: "OK",
            data: Number(
              response?.data?.steps[0]?.distance?.sea?.distance.toFixed(2)
            ),
            success: true,
          };
      } else {
        return {
          message: "Invalid request. Please check your inputs.",
          data: 0,
          success: false,
        };
      }
    } else {
      return {
        message: "Invalid request. Please check your inputs.",
        data: 0,
        success: false,
      };
    }
  } catch (error) {
    return {
      message: error,
      data: 0,
      success: false,
    };
  }
};

export const calculateDistanceInKilometersByPincodeCountry = async (
  organization_id: string,
  transport_mode: string,
  from_location_pincode: string,
  from_country: string,
  to_location_pincode: string,
  to_country: string,
  transit_mode: string
) => {
  try {
    const sdk = await getGraphQlServerSDK();
    const configData = await sdk.getAppGlobalMasterDetailsByType({
      key: [
        GlobalMasterKeys?.GoogleMatrixApiKey,
        GlobalMasterKeys?.RapidApiKey,
      ],
    });
    if (
      transport_mode.toLocaleLowerCase() ===
        TransportModes.Road.toLocaleLowerCase() ||
      transport_mode.toLocaleLowerCase() ===
        TransportModes.Rail.toLocaleLowerCase()
    ) {
      const roadGlobalData = configData?.AppGlobalMaster.filter(
        (item) => item.key == GlobalMasterKeys?.GoogleMatrixApiKey
      );
      const transport_value = TransportModesForAPI.find(
        (item) =>
          sanitizeString.v1(item.name) === sanitizeString.v1(transport_mode)
      );
      let transit_mode_api = "";
      if (!!transport_value && !!transport_value.mode) {
        const mode_value = transport_value.mode.filter(
          (item) =>
            sanitizeString.v1(item.name) === sanitizeString.v1(transit_mode)
        );
        if (!!mode_value.length) {
          transit_mode_api = mode_value[0].value;
        }
      }
      let api_url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${from_location_pincode},${from_country}&destinations=${to_location_pincode},${to_country}&mode=${transport_value?.value}&key=${roadGlobalData[0]?.data?.value}`;
      if (!!transit_mode_api) {
        api_url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${from_location_pincode},${from_country}&destinations=${to_location_pincode},${to_country}&mode=${transport_value?.value}&transit_mode=${transit_mode_api}&key=${roadGlobalData[0]?.data?.value}`;
      }
      const response = await fetch(api_url);
      const data = await response.json();
      let distanceInMeters: number = 0;
      if (data.status === "OK") {
        if (!!transit_mode_api) {
          if (data?.rows[0]?.elements[0].status != "OK") {
            api_url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${from_location_pincode},${from_country}&destinations=${to_location_pincode},${to_country}&key=${roadGlobalData[0]?.data?.value}`;
            const response = await fetch(api_url);
            const data = await response.json();
            distanceInMeters = data?.rows[0]?.elements[0]?.distance?.value;
          } else {
            distanceInMeters = data?.rows[0]?.elements[0]?.distance?.value;
          }
        } else {
          distanceInMeters = data?.rows[0]?.elements[0]?.distance?.value;
        }
        return {
          message: "OK",
          data: Number((distanceInMeters / 1000).toFixed(2)),
          success: true,
        };
      } else {
        return {
          message: data.error_message,
          data: 0,
          success: false,
        };
      }
    } else if (
      transport_mode.toLocaleLowerCase() ===
        TransportModes.Air.toLocaleLowerCase() ||
      transport_mode.toLocaleLowerCase() ===
        TransportModes.Water.toLocaleLowerCase()
    ) {
      const otherThanRoadGlobalData = configData?.AppGlobalMaster.filter(
        (item) => item.key == GlobalMasterKeys?.RapidApiKey
      );
      const transport_value = TransportModesForAPI.find(
        (item) =>
          sanitizeString.v1(item.name) === sanitizeString.v1(transport_mode)
      );
      let mode_param = {};
      if (!!transport_value) {
        mode_param = transport_value.value;
      }
      const fromdist = from_location_pincode + "," + from_country;
      const todist = to_location_pincode + "," + to_country;
      const options = {
        method: "POST",
        url: "https://api.distance.tools/api/v2/distance/route",
        params: mode_param,
        headers: {
          "content-type": "application/json",
          "X-Billing-Token": otherThanRoadGlobalData[0]?.data?.value,
          Host: "api.distance.tools",
        },
        data: {
          route: [
            {
              // name: fromdist.trim(),
              // name: fromdist.trim(),
              name: fromdist.trim(),
              country: from_country.trim(),
            },
            {
              // name: todist.trim(),
              // name: todist.trim(),
              name: todist.trim(),
              country: to_country.trim(),
            },
          ],
        },
      };
      const response = await axios.request(options);
      if (response.statusText === "OK") {
        if (
          transport_mode.toLocaleLowerCase() ===
          TransportModes.Air.toLocaleLowerCase()
        )
          return {
            message: "OK",
            data: Number(
              response?.data?.steps[0]?.distance?.vincenty?.toFixed(2)
            ),
            success: true,
          };
        else
          return {
            message: "OK",
            data: Number(
              response?.data?.steps[0]?.distance?.sea?.distance.toFixed(2)
            ),
            success: true,
          };
      } else {
        return {
          message: "Invalid request. Please check your inputs.",
          data: 0,
          success: false,
        };
      }
    } else {
      return {
        message: "Invalid request. Please check your inputs.",
        data: 0,
        success: false,
      };
    }
  } catch (error) {
    console.error(
      "Error in calculateDistanceInKilometersByPincodeCountry =>",
      error
    );
    return {
      message: error,
      data: 0,
      success: false,
    };
  }
};
export type bulkETLRequest = {
  origin: string;
  destination: string;
  mode_of_transport: string;
  rapidApiRequest: TrapidApiRequest[];
};
export type TrapidApiRequest = {
  name: string;
  country: string;
};
export type locationDistance = {
  from: string;
  to: string;
  distance: Number;
};
export const calculateBulkDistanceInKilometersByPincodeCountry = async (
  organization_id: string,
  transport_mode: string,
  pincodeData: bulkETLRequest[],
  transit_mode: string
) => {
  try {
    let batchSize = 37;
    if (
      transport_mode.toLocaleLowerCase() ===
        TransportModes.Road.toLocaleLowerCase() ||
      transport_mode.toLocaleLowerCase() ===
        TransportModes.Rail.toLocaleLowerCase()
    ) {
      batchSize = 10;
    }
    let totalLength = 0;
    if (pincodeData.length > 0 && pincodeData.length <= batchSize) {
      totalLength = 1;
    } else {
      if (pincodeData.length % batchSize == 0) {
        totalLength = pincodeData.length / batchSize;
      } else {
        totalLength = Math.floor(pincodeData.length / batchSize) + 1;
      }
    }

    const distanceData: locationDistance[] = [];
    const sdk = await getGraphQlServerSDK();
    const configData = await sdk.getAppGlobalMasterDetailsByType({
      key: [
        GlobalMasterKeys?.GoogleMatrixApiKey,
        GlobalMasterKeys?.RapidApiKey,
      ],
    });
    if (
      transport_mode.toLocaleLowerCase() ===
        TransportModes.Road.toLocaleLowerCase() ||
      transport_mode.toLocaleLowerCase() ===
        TransportModes.Rail.toLocaleLowerCase()
    ) {
      const roadGlobalData = configData?.AppGlobalMaster.filter(
        (item) => item.key == GlobalMasterKeys?.GoogleMatrixApiKey
      );
      const transport_value = TransportModesForAPI.find(
        (item) =>
          sanitizeString.v1(item.name) === sanitizeString.v1(transport_mode)
      );
      let transit_mode_api = "";
      if (!!transport_value && !!transport_value.mode) {
        const mode_value = transport_value.mode.filter(
          (item) =>
            sanitizeString.v1(item.name) === sanitizeString.v1(transit_mode)
        );
        if (!!mode_value.length) {
          transit_mode_api = mode_value[0].value;
        }
      }
      for (let batchrequest = 0; batchrequest < totalLength; batchrequest++) {
        const pincodebatchhit = pincodeData.slice(
          batchrequest * batchSize,
          (batchrequest + 1) * batchSize
        );
        if (pincodebatchhit.length > 0) {
          let api_url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=[${pincodebatchhit.map((item) => item.origin).join("|")}]&destinations=[${pincodebatchhit.map((item) => item.destination).join("|")}]&mode=${transport_value?.value}&key=${roadGlobalData[0]?.data?.value}`;
          if (!!transit_mode_api) {
            api_url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=[${pincodebatchhit.map((item) => item.origin).join("|")}]&destinations=[${pincodebatchhit.map((item) => item.destination).join("|")}]&mode=${transport_value?.value}&transit_mode=${transit_mode_api}&key=${roadGlobalData[0]?.data?.value}`;
          }
          const response = await fetch(api_url);
          const data = await response.json();
          const RoadDataSameofRoil: Record<string, any>[] = [];
          if (data.status === "OK") {
            for (let i = 0; i < data?.rows.length; i++) {
              if (!!transit_mode_api) {
                if (data?.rows[i]?.elements[i].status != "OK") {
                  RoadDataSameofRoil.push({
                    origin: pincodebatchhit[i].origin,
                    destination: pincodebatchhit[i].destination,
                  });
                } else {
                  distanceData.push({
                    from: pincodebatchhit[i].origin,
                    to: pincodebatchhit[i].destination,
                    distance: Number(
                      (
                        data?.rows[i]?.elements[i]?.distance?.value / 1000
                      ).toFixed(2)
                    ),
                  });
                }
              } else {
                distanceData.push({
                  from: pincodebatchhit[i].origin,
                  to: pincodebatchhit[i].destination,
                  distance: Number(
                    (
                      data?.rows[i]?.elements[i]?.distance?.value / 1000
                    ).toFixed(2)
                  ),
                });
              }
            }
            if (!!transit_mode_api && !!RoadDataSameofRoil.length) {
              api_url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=[${RoadDataSameofRoil.map((item) => item.origin).join("|")}]&destinations=[${RoadDataSameofRoil.map((item) => item.destination).join("|")}]&key=${roadGlobalData[0]?.data?.value}`;
              const response = await fetch(api_url);
              const data = await response.json();
              for (let i = 0; i < data?.rows.length; i++) {
                distanceData.push({
                  from: RoadDataSameofRoil[i].origin,
                  to: RoadDataSameofRoil[i].destination,
                  distance: Number(
                    (
                      data?.rows[i]?.elements[i]?.distance?.value / 1000
                    ).toFixed(2)
                  ),
                });
              }
            }
          } else {
            return {
              message: data.error_message,
              data: [],
              success: false,
            };
          }
        }
      }
      return {
        message: "OK",
        data: distanceData,
        success: true,
      };
    } else if (
      transport_mode.toLocaleLowerCase() ===
        TransportModes.Air.toLocaleLowerCase() ||
      transport_mode.toLocaleLowerCase() ===
        TransportModes.Water.toLocaleLowerCase()
    ) {
      const otherThanRoadGlobalData = configData?.AppGlobalMaster.filter(
        (item) => item.key == GlobalMasterKeys?.RapidApiKey
      );
      const transport_value = TransportModesForAPI.find(
        (item) =>
          sanitizeString.v1(item.name) === sanitizeString.v1(transport_mode)
      );
      let mode_param = {};
      if (!!transport_value) {
        mode_param = transport_value.value;
      }
      for (
        let rapidbatchrequest = 0;
        rapidbatchrequest < totalLength;
        rapidbatchrequest++
      ) {
        const pincodebatchhit = pincodeData.slice(
          rapidbatchrequest * batchSize,
          (rapidbatchrequest + 1) * batchSize
        );
        if (pincodebatchhit.length > 0) {
          const routeData = pincodebatchhit.flatMap(
            (item) => item.rapidApiRequest
          );
          // let UniqueRoute = _.uniqWith(routeData, _.isEqual);
          let UniqueRoute = routeData;
          const options = {
            method: "POST",
            url: "https://api.distance.tools/api/v2/distance/route",
            params: mode_param,
            headers: {
              "content-type": "application/json",
              "X-Billing-Token": otherThanRoadGlobalData[0]?.data?.value,
              Host: "api.distance.tools",
            },
            data: {
              route: UniqueRoute,
            },
          };
          const response = await axios.request(options);
          if (response.statusText === "OK") {
            // Extract pincodes from points array
            const points = response?.data?.points || [];
            const steps = response?.data?.steps || [];

            // Helper function to extract pincode from different response structures
            const extractPincode = (point: any): string => {
              const geocode = point?.properties?.geocode;
              if (!geocode) return "";

              // Try different fields based on API response type
              // For 'postcode' type (USA, etc.)
              if (geocode.postalcode) {
                if (geocode.postalcode.split(",").length === 1) {
                  const alpha3 = geocode.isoCountry?.alpha3 || "";
                  return `${geocode.postalcode},${alpha3}`;
                }
                return `${geocode.postalcode}`;
              }

              // For 'opencage' type (UK, etc.)
              if (geocode.zipcode) {
                let alpha2 = geocode.isoCountry?.alpha2 || "";
                if (alpha2 === "GB") {
                  alpha2 = "UK";
                }
                // Convert to lowercase and remove all spaces
                const formattedZipcode = geocode.zipcode
                  .toLowerCase()
                  .replace(/\s+/g, "");

                if (geocode.zipcode.split(",").length === 1) {
                  return `${formattedZipcode},${alpha2}`;
                }
                return formattedZipcode;
              }

              // For 'name' type (original format) - return as is without splitting
              if (geocode.name) {
                if (geocode.name.split(",").length === 1) {
                  const alpha3 = geocode.isoCountry?.alpha3 || "";
                  return `${geocode.name},${alpha3}`;
                }
                return geocode.name;
              }

              return "";
            };

            // Process each step (consecutive pair of locations)
            for (let i = 0; i < steps.length; i++) {
              // Get pincode for current and next point
              //let a = extractPincode(points[i]);
              //let b = extractPincode(points[i + 1]);
              const fromPincodeValue = routeData[i].name; //extractPincode(points[i]);
              const toPincodeValue = routeData[i + 1].name; //extractPincode(points[i + 1]);

              // Get the Vincenty distance from steps
              const vincentyDistance =
                transport_mode.toLocaleLowerCase() ===
                TransportModes.Air.toLocaleLowerCase()
                  ? Number(steps[i]?.distance?.vincenty?.toFixed(2))
                  : Number(steps[i]?.distance?.sea?.distance.toFixed(2));

              distanceData.push({
                from: fromPincodeValue,
                to: toPincodeValue,
                distance: vincentyDistance,
              });
            }
          } else {
            return {
              message: "Invalid request. Please check your inputs.",
              data: 0,
              success: false,
            };
          }
        }
      }
      return {
        message: "OK",
        data: distanceData,
        success: true,
      };
    } else {
      return {
        message: "Invalid request. Please check your inputs.",
        data: 0,
        success: false,
      };
    }
  } catch (error) {
    return {
      message: error,
      data: 0,
      success: false,
    };
  }
};
