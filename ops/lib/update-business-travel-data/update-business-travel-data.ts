import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "~/graphql/server";
import { GhgTransport_BusinessTravel_Updates } from "~/graphql/shared/types";
import { sanitizeString } from "~/utils/sanitize.util";
import { saveGHGTransportBusinessTravel } from "../auditlog/auditlog.service";
import {
  calculateEmission,
  saveEmissionDashboard,
} from "../emission-calculation-engine/emisison-calculation.service";

export const updateBusinessTraveTripDistancelData = async (
  organizationId: string
) => {
  try {
    const sdk = await getGraphQlServerSDK();
    //#region fetch data from business travel where trip distance is null and get travel distance data from it
    let updateBusinessTravel: GhgTransport_BusinessTravel_Updates[] = [];
    const nullDistanceData = await sdk.getNullDistanceBusinessTravelData({});
    if (!!nullDistanceData?.GHGTransport_BusinessTravel.length) {
      const TravelDistancewhereCondition: Record<string, any>[] =
        nullDistanceData?.GHGTransport_BusinessTravel.map((item) => {
          return {
            _and: {
              from_location_pincode: {
                _eq: sanitizeString.v4(String(item.Trip_From_Pincode)),
              },
              from_location_country: {
                _ilike: sanitizeString.v4(String(item.Trip_From_Country)),
              },
              to_location_pincode: {
                _eq: sanitizeString.v4(String(item.Trip_To_Pincode)),
              },
              to_location_country: {
                _ilike: sanitizeString.v4(String(item.Trip_To_Country)),
              },
              // distance: {
              //   _is_null: false,
              // },
              mode_of_transport: {
                _ilike: sanitizeString.v4(String(item.Mode_of_Transport)),
              },
              is_deleted: { _eq: false },
            },
          };
        });
      const uniqueTravelDistanceWhereCondition = _.uniqWith(
        TravelDistancewhereCondition,
        _.isEqual
      );
      const travelDistanceData = await sdk.getTravelDistanceDetail({
        where: { _or: uniqueTravelDistanceWhereCondition },
      });
      //#endregion
      //#region after fetching Travel distance Data setting bulk update Variable of business travel
      for (let i = 0; i < travelDistanceData?.TravelDistance.length; i++) {
        const IdtoUpdate = nullDistanceData?.GHGTransport_BusinessTravel.filter(
          (obj1) =>
            sanitizeString.v4(String(obj1.Trip_From_Pincode)) ==
              sanitizeString.v4(
                String(
                  travelDistanceData?.TravelDistance[i].from_location_pincode
                )
              ) &&
            sanitizeString.v4(String(obj1.Trip_From_Country)) ==
              sanitizeString.v4(
                String(
                  travelDistanceData?.TravelDistance[i].from_location_country
                )
              ) &&
            sanitizeString.v4(String(obj1.Trip_To_Pincode)) ==
              sanitizeString.v4(
                String(
                  travelDistanceData?.TravelDistance[i].to_location_pincode
                )
              ) &&
            sanitizeString.v4(String(obj1.Trip_To_Country)) ==
              sanitizeString.v4(
                String(
                  travelDistanceData?.TravelDistance[i].to_location_country
                )
              ) &&
            sanitizeString.v4(String(obj1.Mode_of_Transport)) ==
              sanitizeString.v4(
                String(travelDistanceData?.TravelDistance[i].mode_of_transport)
              )
        );
        if (!!IdtoUpdate.length) {
          IdtoUpdate.forEach((items) => {
            updateBusinessTravel.push({
              where: {
                id: {
                  _eq: items?.id,
                },
              },
              _set: {
                Trip_Distance: travelDistanceData?.TravelDistance[i].distance,
              },
            });
          });
        }
      }
      //#endregion
      //#region updating Business travel trip distance
      if (!!updateBusinessTravel.length) {
        const processBatch = async (batch: any[]): Promise<any> => {
          return await sdk.updateGhgTransportBusinessTravel({
            GhgTransportBusinessTravel: batch,
          });
        };
        const batchSize = 2000;
        for (let i = 0; i < updateBusinessTravel.length; i += batchSize) {
          const batch = updateBusinessTravel.slice(i, i + batchSize);
          const res = await processBatch(batch);
          if (!!res.update_GHGTransport_BusinessTravel_many.length) {
            await saveGHGTransportBusinessTravel(
              res.update_GHGTransport_BusinessTravel_many?.flatMap(
                (items: any) => items?.returning[0]
              ),
              organizationId as UUID,
              res.update_GHGTransport_BusinessTravel_many[0]?.returning[0]
                .created_by as UUID,
              []
            );

            const uniquetask_request_id =
              res?.update_GHGTransport_BusinessTravel_many
                ?.map((items: any) => items.returning[0].task_request_id)
                .filter(
                  (item: any, index: any, self: any) =>
                    index === self.findIndex((t: any) => t === item)
                ) as UUID[];
            await calculateEmission(
              organizationId,
              "transport_business_travel",
              uniquetask_request_id
            );
            await saveEmissionDashboard(uniquetask_request_id, organizationId);
          }
        }
      }
      //#endregion
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
      message: updateBusinessTravel.length + " record updated",
    };
  } catch (error: any) {
    console.log("Update Business Travel Trip Distance : " + error);
    return {
      status: "Ok",
      statusCode: 500,
      message: error,
    };
  }
};
