import _ from "lodash";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { TravelDistance_Updates } from "@/modules/ghg/graphql/shared/types";
import {
  ModeOfTransport,
  TransportModes,
} from "@/modules/ghg/shared/constants/input.constant";
import {
  bulkETLRequest,
  calculateBulkDistanceInKilometersByPincodeCountry,
  locationDistance,
} from "@/modules/ghg/shared/services/distance-calculation.service";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

export const distanceMatrixCalculation = async (
  fromDate: Date,
  toDate: Date,
  organizationId: string
) => {
  try {
    const sdk = await getGraphQlServerSDK();
    let TravelDistance_Updates: TravelDistance_Updates[] = [];
    let totalRecords: number = 0;
    //#region fetching data from travel distance where distance is null and preparing format of unique data according to ETL API
    const nullDistanceData = await sdk.getNullDistanceTravelDdistanceData({
      fromdate: fromDate,
      todate: toDate,
    });
    const EtlData: bulkETLRequest[] = nullDistanceData?.TravelDistance?.map(
      (item) => {
        return {
          origin:
            sanitizeString.v2(String(item.from_location_pincode)) +
            "," +
            sanitizeString.v2(String(item.from_location_country)),
          destination:
            sanitizeString.v2(String(item.to_location_pincode)) +
            "," +
            sanitizeString.v2(String(item.to_location_country)),
          mode_of_transport: sanitizeString.v3(String(item.mode_of_transport)),
          rapidApiRequest: [
            {
              name:
                sanitizeString.v2(String(item.from_location_pincode)) +
                "," +
                sanitizeString.v2(String(item.from_location_country)),
              country: sanitizeString.v2(String(item.from_location_country)),
            },
            {
              name:
                sanitizeString.v2(String(item.to_location_pincode)) +
                "," +
                sanitizeString.v2(String(item.to_location_country)),
              country: sanitizeString.v2(String(item.to_location_country)),
            },
          ],
        };
      }
    );
    let UniqueEtlData = _.uniqWith(EtlData, _.isEqual).slice(0, 500);
    //#endregion
    let batchSize = 300;
    if (!!UniqueEtlData.length) {
      for (let i = 0; i < ModeOfTransport.length; i++) {
        //#region fetching data from ETL API request according to Mode of Transport and creating update variable of Travel Distance
        if (
          ModeOfTransport[i] == TransportModes.Air ||
          ModeOfTransport[i] == TransportModes.Water
        ) {
          batchSize = 37;
        }
        const EtlDataperMode = UniqueEtlData.filter(
          (items) =>
            sanitizeString.v4(String(items.mode_of_transport)) ==
            sanitizeString.v4(ModeOfTransport[i])
        );
        let totalLength = 0;
        if (EtlDataperMode.length > 0 && EtlDataperMode.length <= batchSize) {
          totalLength = 1;
        } else {
          if (EtlDataperMode.length % batchSize == 0) {
            totalLength = EtlDataperMode.length / batchSize;
          } else {
            totalLength = Math.floor(EtlDataperMode.length / batchSize) + 1;
          }
        }
        for (let j = 0; j < totalLength; j++) {
          TravelDistance_Updates = [];
          const dataToHitAPI = EtlDataperMode.slice(
            j * batchSize,
            (j + 1) * batchSize
          ) as bulkETLRequest[];
          const distanceData =
            await calculateBulkDistanceInKilometersByPincodeCountry(
              organizationId,
              ModeOfTransport[i],
              dataToHitAPI,
              ModeOfTransport[i] === TransportModes.Rail ? "rail" : ""
            );
          if (distanceData.success) {
            const DistancesofLocation: locationDistance[] =
              distanceData.data as locationDistance[];

            for (let k = 0; k < DistancesofLocation.length; k++) {
              const IdtoUpdate = nullDistanceData?.TravelDistance.filter(
                (items) =>
                  (
                    sanitizeString.v4(String(items.from_location_pincode)) +
                    "," +
                    sanitizeString.v4(String(items.from_location_country))
                  ).trim() ==
                    sanitizeString.v4(String(DistancesofLocation[k].from)) &&
                  (
                    sanitizeString.v4(String(items.to_location_pincode)) +
                    "," +
                    sanitizeString.v4(String(items.to_location_country))
                  ).trim() ==
                    sanitizeString.v4(String(DistancesofLocation[k].to)) &&
                  sanitizeString.v4(String(items.mode_of_transport)) ==
                    sanitizeString.v4(ModeOfTransport[i])
              );
              IdtoUpdate.forEach((items) => {
                TravelDistance_Updates.push({
                  where: {
                    id: {
                      _eq: items?.id,
                    },
                  },
                  _set: {
                    distance: DistancesofLocation[k].distance,
                  },
                });
              });
            }
            //#endregion
            //#region Updating All Data
            if (!!TravelDistance_Updates.length) {
              totalRecords = totalRecords + TravelDistance_Updates.length;
              const updateData = await sdk.updateBulkTravelDistance({
                TravelDistanceUpdate: TravelDistance_Updates,
              });
            }
            //#endregion
          }
        }
      }
    } else {
      return {
        status: "Ok",
        statusCode: 200,
        message: "No Record to Update",
      };
    }
    return {
      status: "Ok",
      statusCode: 200,
      message: totalRecords + " record updated",
    };
  } catch (error: any) {
    console.log("Distance Matrix API: " + error);
    return {
      status: "Ok",
      statusCode: 500,
      message: error,
    };
  }
};
