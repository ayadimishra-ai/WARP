import { UUID } from "crypto";
import _ from "lodash";
import { useCallback } from "react";
import { EmissioncalculationEnergyGrid } from "@/app/ghg//actions/emissioncalculation";
import { useDeleteMeterDataMutation } from "@/modules/ghg/graphql/mutations/delete-meter-data.generated";
import { useInsertActivityTaskRequestMutation } from "@/modules/ghg/graphql/mutations/insert-activity-task-request.generated";
import { useInsertMeterDataMutation } from "@/modules/ghg/graphql/mutations/insert-ai-meterdata.generated";
import { useInsertMeterOrganizationAddressMappingDataMutation } from "@/modules/ghg/graphql/mutations/insert-ai-meterorganizationaddressmapping.generated";
import { useInsertTaskRequestMutation } from "@/modules/ghg/graphql/mutations/Insert-task-request.generated";
import { useAiFileActivityInsertTaskRequestMutation } from "@/modules/ghg/graphql/mutations/insert_aIfile-activitytaskrequest.generated";
import { useUpdateAiFileDataMutation } from "@/modules/ghg/graphql/mutations/update-ai-data.generated";
import { useUpdateAiFileUploadsMutation } from "@/modules/ghg/graphql/mutations/update-ai-uploads-status.generated";
import { useUpdateMeterDataMutation } from "@/modules/ghg/graphql/mutations/update-meterdata-by-filedataId.generated";
import { useUpsertGhgEnergy_GridPowerActivityMutation } from "@/modules/ghg/graphql/mutations/upsert-energy-grid-power-data.generated";
import { useGetactivityTaskRequestDataQuery } from "@/modules/ghg/graphql/queries/get-activity-task-request-data.generated";
import { useGetActivitybycodeQuery } from "@/modules/ghg/graphql/queries/get-activitybycode.generated";
import { useGetAddressDetailQuery } from "@/modules/ghg/graphql/queries/get-address-detail.generated";
import { useGetAiFiledatabydateQuery } from "@/modules/ghg/graphql/queries/get-ai-filedata-by-date.generated";
import { useGetGhgEnergyGridPowerDataQuery } from "@/modules/ghg/graphql/queries/get-ghg-energy-grid-power-data.generated";
import { useGetMeterDataByFileIdQuery } from "@/modules/ghg/graphql/queries/get-meter-data.generated";
import { useGetMeterOrganizationAddressMappingQuery } from "@/modules/ghg/graphql/queries/get-meterorganizationaddressmapping.generated";
import { useGetPowerConsumptionDetailsForAiQuery } from "@/modules/ghg/graphql/queries/get-power-consumption-details-for-ai.generated";
import { useGettaskRequestQuery } from "@/modules/ghg/graphql/queries/get-task-request.generated";
import {
  ActivityTaskRequest_Insert_Input,
  AiFileActivityTaskRequestMapping_Insert_Input,
  GhgEnergyConsumption_GridPower_Insert_Input,
  GhgEnergyConsumption_GridPower_Updates,
  MeterData_Insert_Input,
  TaskRequest_Insert_Input,
} from "@/modules/ghg/graphql/shared/types";
import { AIFileUploadStatus, isUUID } from "@/modules/ghg/shared/constants/ai-constant";
import { addressTypeAllowedActivity } from "@/modules/ghg/shared/constants/input.constant";
import { AllMeterDetails } from "@/modules/ghg/shared/types/ai-types";
import {
  formatDateToLocalISO,
  formatDateToLocalISO_compare,
  getMonthName,
  getMonthNumberAndIndex,
} from "@/modules/ghg/utils/date.util";
import { sanitizeString, toSentenceCase } from "@/modules/ghg/utils/sanitize.util";
import {
  auditLogFileData,
  auditLogFileUpload,
  auditLogGHGEnergyConsumptionGridPower,
  auditLogMeterData,
} from "@/app/ghg/actions/auditlog";
import {
  TActivityTaskRequestMasterData,
  TSheetGridDataWithId,
} from "../lib/excel/excel.service";
import { toTitleCase } from "../lib/shared/constants/input.constant";

/**
 * Custom hook to expose AI File Data business logic functions for client-side usage.
 * All logic is now implemented here instead of a separate service file.
 */
export function useAiFileData() {
  // All business logic functions from ai-filedata-service.ts are now defined here
  const getMeterOrgAddressMapping = useGetMeterOrganizationAddressMappingQuery({
    skip: true,
  });
  const getAIFiledatabydate = useGetAiFiledatabydateQuery({
    skip: true,
  });
  const getAddressDetails = useGetAddressDetailQuery({
    skip: true,
  });
  const getActivityByCode = useGetActivitybycodeQuery({
    skip: true,
  });
  const getTaskRequest = useGettaskRequestQuery({
    skip: true,
  });
  const getActivityTaskRequest = useGetactivityTaskRequestDataQuery({
    skip: true,
  });
  const getPowerConsumptionData = useGetPowerConsumptionDetailsForAiQuery({
    skip: true,
  });
  const getEnergyGriddata = useGetGhgEnergyGridPowerDataQuery({
    skip: true,
  });
  const getMeterDataByFileId = useGetMeterDataByFileIdQuery({
    skip: true,
  });
  const [insertMeterDataMutation] = useInsertMeterDataMutation();
  const [updateAiFileUploadMutation] = useUpdateAiFileUploadsMutation();
  const [updateAiFileDataMutation] = useUpdateAiFileDataMutation();
  const [insertMeterOrgAddressMappingMutation] =
    useInsertMeterOrganizationAddressMappingDataMutation();
  const [insertActivityTaskRequestMutation] =
    useInsertActivityTaskRequestMutation();
  const [insertTaskRequestMutation] = useInsertTaskRequestMutation();
  const [upsertGhgEnergeyGridPowerActivityMutation] =
    useUpsertGhgEnergy_GridPowerActivityMutation();
  const [insertAiFileActivityTaskRequestMutation] =
    useAiFileActivityInsertTaskRequestMutation();
  const [updateMeterData] = useUpdateMeterDataMutation();
  const [deleteMeterData] = useDeleteMeterDataMutation();

  //check task_request, if not create new
  const getTaskRequestActvityTaskRequestId = useCallback(
    async (
      org_address_id: UUID,
      activitycode: string,
      userId: String,
      Datelist: string[]
    ) => {
      const monthYearlist: Record<string, any>[] = [];
      const finalYearMonth: Record<string, any>[] = [];
      const whereCondition: Record<string, any>[] = [];
      const activityTaskRequestWhereRequest: Record<string, any>[] = [];

      //Fetch Address Details
      const addressData = await getAddressDetails.refetch({
        organisationAddressId: org_address_id,
      });

      const addresstype = addressTypeAllowedActivity.filter(
        (item: Record<string, any>) =>
          sanitizeString.v1(item.name) ==
          sanitizeString.v1(
            addressData?.data?.OrganizationAddress[0].Address.type ?? ""
          )
      );
      const allowedactivity = addresstype[0]?.data?.filter(
        (item: Record<string, any>) =>
          sanitizeString.v1(item.name) ==
          sanitizeString.v1(
            addressData?.data?.OrganizationAddress[0].Address.ownership_type ??
              ""
          )
      )[0].data;

      //Fetch activity date by activity code
      const activityData = await getActivityByCode.refetch({
        activitycode: allowedactivity,
      });

      const currentActivityId = activityData?.data?.Activity.filter(
        (item: { id: any; code: string }) =>
          sanitizeString.v1(item.code) == sanitizeString.v1(activitycode)
      )[0].id;
      //loop for all dates
      Datelist?.forEach((inputDate: any) => {
        const date = new Date(inputDate);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const monthname = getMonthName(month);
        if (year && monthname)
          monthYearlist.push({
            Year: year,
            Month: toSentenceCase(monthname),
            Combination: year + "" + toSentenceCase(monthname),
          });
        let grouped_data = _.groupBy(monthYearlist, "Combination");

        Object.keys(grouped_data).map((item: any) => {
          let keydata = grouped_data[item];
          if (
            keydata.length > 0 &&
            finalYearMonth.filter(
              (x: any) =>
                x.year == keydata[0].Year && x.month == keydata[0].Month
            ).length == 0
          ) {
            finalYearMonth.push({
              year: keydata[0].Year,
              month: keydata[0].Month,
            });
            whereCondition.push({
              _and: {
                year: { _eq: keydata[0].Year },
                month: { _eq: keydata[0].Month },
                organization_address_id: { _eq: org_address_id },
              },
            });
          }
        });
      });
      //loop end
      //Fetch task request
      const taskRequest = await getTaskRequest.refetch({
        where: { _or: whereCondition },
        activityId: currentActivityId,
      });

      const leftoutActivityTaskRequestData: Record<string, UUID>[] = [];
      const foreignKeyInsertionObject: Record<string, any>[] = [];
      if (!!taskRequest?.data && taskRequest?.data?.TaskRequest?.length > 0) {
        taskRequest?.data?.TaskRequest?.forEach((item: Record<string, any>) => {
          if (item.ActivityTaskRequests.length == 0) {
            leftoutActivityTaskRequestData.push({
              organization_address_id: org_address_id,
              activity_id: currentActivityId,
              task_request_id: item?.id,
              //created_by: userId as UUID,
              //updated_by: userId as UUID,
            });
          } else {
            item.ActivityTaskRequests.forEach(
              (activitytaskitem: Record<string, UUID>) => {
                foreignKeyInsertionObject.push({
                  taskRequestId: item.id,
                  organization_address_id: item.organization_address_id,
                  month: item.month,
                  year: item.year,
                  activityTaskRequestId: activitytaskitem.id,
                });
              }
            );
          }
        });
      }

      if (leftoutActivityTaskRequestData.length > 0) {
        try {
          const pendingActivityTaskreuqestdata =
            await insertActivityTaskRequestMutation({
              variables: {
                input: leftoutActivityTaskRequestData,
              },
            });

          if (!!pendingActivityTaskreuqestdata?.data) {
            pendingActivityTaskreuqestdata?.data?.insert_ActivityTaskRequest?.returning.forEach(
              (activityitem) => {
                activityTaskRequestWhereRequest.push({
                  _and: {
                    organization_address_id: { _eq: org_address_id },
                    activity_id: { _eq: activityitem.activity_id },
                    task_request_id: { _eq: activityitem.task_request_id },
                  },
                });
              }
            );
          }
        } catch (error) {
          console.error("Error fetching taskrequest insertion data", { error });
        }
      }
      const insertionTaskRequestData = monthYearlist?.filter(
        (obj1) =>
          !taskRequest?.data?.TaskRequest.some(
            (obj2) => obj1.Month === obj2.month && obj1.Year === obj2.year
          )
      ) as Record<string, any>[];

      const taskRequestObj: TaskRequest_Insert_Input[] =
        insertionTaskRequestData.map((taskInput: Record<string, any>) => {
          const input = {
            organization_address_id: org_address_id,
            month: toTitleCase(taskInput.Month),
            year: taskInput.Year,
            created_by: userId as UUID,
            updated_by: userId as UUID,
          };
          return input;
        });

      //Insert new task requests
      const UniqtaskRequestObj = _.uniqWith(taskRequestObj, _.isEqual);
      const taskRequestInsert = await insertTaskRequestMutation({
        variables: {
          input: UniqtaskRequestObj,
        },
      });
      const ActivityTaskRequestDataCombination: Record<string, UUID>[] = [];
      taskRequestInsert?.data?.insert_TaskRequest?.returning.map((taskid) => {
        activityData?.data?.Activity.map((activityitem) => {
          ActivityTaskRequestDataCombination.push({
            organization_address_id: org_address_id,
            activity_id: activityitem.id,
            task_request_id: taskid?.id,
            //created_by: userId as UUID,
            // updated_by: userId as UUID,
          });
          activityTaskRequestWhereRequest.push({
            _and: {
              organization_address_id: { _eq: org_address_id },
              activity_id: { _eq: activityitem.id },
              task_request_id: { _eq: taskid?.id },
            },
          });
        });
      });
      const activityTaskMasterData = await getActivityTaskRequest.refetch({
        where: { _or: activityTaskRequestWhereRequest },
      });

      const activityTaskRequestobj = ActivityTaskRequestDataCombination?.filter(
        (obj1) =>
          !activityTaskMasterData?.data?.ActivityTaskRequest.some(
            (obj2) =>
              obj1.activity_id === obj2.activity_id &&
              obj1.task_request_id === obj2.task_request_id &&
              obj1.organization_address_id === obj2.organization_address_id
          )
      ) as ActivityTaskRequest_Insert_Input[];
      if (
        activityTaskRequestobj.length == 0 &&
        leftoutActivityTaskRequestData.length > 0
      ) {
        if (!!activityTaskMasterData) {
          activityTaskMasterData?.data?.ActivityTaskRequest.forEach(
            (activitytaskitem) => {
              foreignKeyInsertionObject.push({
                taskRequestId: activitytaskitem.task_request_id,
                organization_address_id: org_address_id,
                month: activitytaskitem.TaskRequest.month,
                year: activitytaskitem.TaskRequest.year,
                activityTaskRequestId: activitytaskitem.id,
              });
            }
          );
        }
      }
      //Insert activity task request
      const ActivityTaskreuqestdata = await insertActivityTaskRequestMutation({
        variables: { input: activityTaskRequestobj },
      });

      taskRequestInsert?.data?.insert_TaskRequest?.returning.forEach((item) => {
        ActivityTaskreuqestdata?.data?.insert_ActivityTaskRequest?.returning
          .filter(
            (activityTaskitem) =>
              activityTaskitem.task_request_id == item.id &&
              activityTaskitem.activity_id == currentActivityId
          )
          .forEach((activityTaskFiltereditem) => {
            foreignKeyInsertionObject.push({
              taskRequestId: item.id,
              organization_address_id: item.organization_address_id,
              month: item.month,
              year: item.year,
              activityTaskRequestId: activityTaskFiltereditem.id,
            });
          });
      });
      return foreignKeyInsertionObject;
    },
    []
  );

  type MeterDetail_old = {
    LocationId: string;
    UnitsConsumed: number;
  };

  async function checkUnwantedUnitsData(
    gridpowerCurrentFiledata: Record<string, any>[],
    meterData: Record<string, any>
  ): Promise<any[]> {
    if (
      !gridpowerCurrentFiledata?.length ||
      !gridpowerCurrentFiledata[0]?.AIFileUpload?.AIFileData?.[0]
    ) {
      return [];
    }
    const fileData = gridpowerCurrentFiledata[0].AIFileUpload.AIFileData[0];

    const {
      edited_values = {},
      extracted_values = {},
      present_reading_date,
      previous_reading_date,
    } = fileData;

    let locationUnitsList: { Location: UUID; UnitsConsumed: number }[] = [];

    const editedMeterDetails = edited_values.MeterDetails || [];
    const extractedMeterDetails = extracted_values.MeterDetails || [];

    // We'll assume meters correspond by index — if you have MeterNumber to match, you can adjust accordingly.
    const maxLength = Math.max(
      editedMeterDetails.length,
      extractedMeterDetails.length
    );

    for (let i = 0; i < maxLength; i++) {
      const editedMeter = editedMeterDetails[i];
      const extractedMeter = extractedMeterDetails[i];
      locationUnitsList.push({
        Location:
          editedMeter?.LocationId !== "" &&
          editedMeter?.LocationId !== null &&
          editedMeter?.LocationId !== undefined
            ? editedMeter.LocationId
            : (extractedMeter?.Location ?? ""),
        UnitsConsumed:
          editedMeter?.UnitsConsumed !== "" &&
          editedMeter?.UnitsConsumed !== null &&
          editedMeter?.UnitsConsumed !== undefined
            ? editedMeter.UnitsConsumed
            : (extractedMeter?.UnitsConsumed ?? 0),
      });
    }
    const prevDateMatch =
      formatDateToLocalISO_compare(new Date(previous_reading_date)) ===
      formatDateToLocalISO_compare(new Date(meterData?.PreviousReadingDate));

    const presentDateMatch =
      formatDateToLocalISO_compare(new Date(present_reading_date)) ===
      formatDateToLocalISO_compare(new Date(meterData?.PresentReadingDate));
    // const isSameUnitsAndLocations = meterData.MeterDetails?.every(
    //   (incomingItem: MeterDetail_old) => {
    //     return locationUnitsList.some(
    //       (existingItem) =>
    //         existingItem.Location === incomingItem.LocationId &&
    //         existingItem.UnitsConsumed === incomingItem.UnitsConsumed
    //     );
    //   }
    // );

    const isSameUnitsAndLocations = (() => {
      // Check total sum of units first
      const totalUnitsIncoming = meterData.MeterDetails?.reduce(
        (sum: any, item: any) => sum + (item.UnitsConsumed || 0),
        0
      );

      const totalUnitsExisting = locationUnitsList.reduce(
        (sum, item) => sum + (item.UnitsConsumed || 0),
        0
      );

      // If totals don't match, return false
      if (Math.abs(totalUnitsIncoming - totalUnitsExisting) > 0.01) {
        // Using small epsilon for float comparison
        return false;
      }

      // Group by location for easier comparison
      const incomingByLocation = new Map<string, number[]>();
      meterData.MeterDetails?.forEach((item: any) => {
        if (!incomingByLocation.has(item.LocationId)) {
          incomingByLocation.set(item.LocationId, []);
        }
        incomingByLocation.get(item.LocationId)?.push(item.UnitsConsumed);
      });

      const existingByLocation = new Map<string, number[]>();
      locationUnitsList.forEach((item) => {
        if (!existingByLocation.has(item.Location)) {
          existingByLocation.set(item.Location, []);
        }
        existingByLocation.get(item.Location)?.push(item.UnitsConsumed);
      });

      // Compare location-wise sums and counts
      for (const [locationId, incomingUnits] of incomingByLocation) {
        const existingUnits = existingByLocation.get(locationId);

        // If location doesn't exist in existing data
        if (!existingUnits) {
          return false;
        }

        // Compare sum of units for this location
        const incomingSum = incomingUnits.reduce(
          (sum, val) => sum + (val || 0),
          0
        );
        const existingSum = existingUnits.reduce(
          (sum, val) => sum + (val || 0),
          0
        );

        if (Math.abs(incomingSum - existingSum) > 0.01) {
          return false;
        }

        // Compare number of meter entries for this location
        if (incomingUnits.length !== existingUnits.length) {
          return false;
        }
      }

      return true;
    })();
    // if (isSameUnitsAndLocations && prevDateMatch && presentDateMatch) {
    //   return []; // ✅ No mismatch
    // }
    if (isSameUnitsAndLocations && prevDateMatch && presentDateMatch) {
      return []; // ✅ No mismatch
    } else {
      // Step 1: Flatten readings and collect all readings
      //     const allReadings: { Location: string; UnitsConsumed: number }[] = [];

      // Step 2: Collect unique location IDs using a Set
      const locationIds_old = new Set<string>();
      for (let i = 0; i < locationUnitsList.length; i++) {
        locationIds_old.add(locationUnitsList[i].Location);
      }

      const hasMultipleLocations = locationIds_old.size > 1;

      // Step 3: Calculate total units consumed if only one location
      let totalUnitsConsumed: number | null = null;
      if (!hasMultipleLocations) {
        totalUnitsConsumed = 0;
        for (let i = 0; i < locationUnitsList.length; i++) {
          totalUnitsConsumed += locationUnitsList[i].UnitsConsumed || 0;
        }
      }

      // Step 4: Compute average units by location
      const averageUnitsByLocation_old: Record<string, any> = {};

      for (const locationId of locationIds_old) {
        const locationMeters: { Location: string; UnitsConsumed: number }[] =
          [];

        for (let i = 0; i < locationUnitsList.length; i++) {
          if (locationUnitsList[i].Location === locationId) {
            locationMeters.push(locationUnitsList[i]);
          }
        }

        let totalUnits = 0;
        if (hasMultipleLocations) {
          for (let i = 0; i < locationMeters.length; i++) {
            totalUnits += locationMeters[i].UnitsConsumed || 0;
          }
        } else {
          totalUnits = totalUnitsConsumed!;
        }

        if (
          totalUnits != null &&
          previous_reading_date &&
          present_reading_date
        ) {
          const average = calculateAverageUnitsByMonth(
            previous_reading_date,
            present_reading_date,
            totalUnits
          );

          if (
            average &&
            typeof average === "object" &&
            typeof locationId === "string" &&
            locationId.trim() !== ""
          ) {
            averageUnitsByLocation_old[locationId] = { ...average };
          }
        }
      }

      const result: any[] = [];
      for (const locationId in averageUnitsByLocation_old) {
        result.push({
          locationId,
          ...averageUnitsByLocation_old[locationId],
        });
      }

      return result;
    }
  }

  // insert_verfied_data_ghg_tables
  const insertVerifiedDataGhgTables = useCallback(
    async (
      meterData: AllMeterDetails,
      activitycode: string,
      userId: string,
      fileId: string,
      filedataId: string,
      organizationId: string
    ) => {
      if (!fileId) {
        return {
          status: "error",
          message: "File ID is required for insertion",
        };
      }
      const locationIds_new: Set<UUID> = new Set(
        meterData.MeterDetails.map((item: any) => item.LocationId as UUID)
      );

      const hasMultipleLocations = locationIds_new.size > 1;
      //condition to check multiple meter locations
      const totalUnitsConsumed = hasMultipleLocations
        ? null
        : meterData.MeterDetails.reduce(
            (sum: any, item: any) => sum + item.UnitsConsumed,
            0
          );
      //units will be added on basis of multiple meters
      const averageUnitsByLocation_new = new Map<string, Record<string, any>>();
      const combinedTaskRequestData: TActivityTaskRequestMasterData[] = [];
      const aiFileDataInsert: AiFileActivityTaskRequestMapping_Insert_Input[] =
        [];

      let gridpower_current_filedata: any[] = [];
      let gridpower_all_files_data: any[] = [];
      let unwanted_units_data: any[] = [];
      let EnergyGrid_manual_data: any[] = [];
      const Taskrequestlist: string[] = []; // Or UUID[] if you have a UUID type alias

      // Step 1: Precompute data by LocationId
      try {
        const locationIdsArray = Array.from(locationIds_new);
        //loop for single/locations selected
        for (let l = 0; l < locationIdsArray.length; l++) {
          const locationId_new = locationIdsArray[l];

          const locationMeters_new = meterData.MeterDetails.filter(
            (m: any) => m.LocationId === locationId_new
          );
          //units will be added on basis of meters
          const totalUnits_meter = hasMultipleLocations
            ? locationMeters_new.reduce(
                (sum: any, m: any) => sum + (m.UnitsConsumed ?? 0),
                0
              )
            : (totalUnitsConsumed ?? 0);
          //this will return the average units for each month selected
          const averageunitsbymonth_meter = calculateAverageUnitsByMonth(
            meterData.PreviousReadingDate,
            meterData.PresentReadingDate,
            totalUnits_meter
          );
          //this will set units calculated to location for filtering
          averageUnitsByLocation_new.set(
            locationId_new,
            averageunitsbymonth_meter
          );

          // Build date list from previous to present reading dates
          const prevDate = new Date(meterData.PreviousReadingDate);
          const presentDate = new Date(meterData.PresentReadingDate);

          let startDate = new Date(
            prevDate.getFullYear(),
            prevDate.getMonth(),
            1
          );
          const endDate = new Date(
            presentDate.getFullYear(),
            presentDate.getMonth(),
            1
          );

          const Datelist: string[] = [];
          while (startDate <= endDate) {
            const year = startDate.getFullYear();
            const month = String(startDate.getMonth() + 1).padStart(2, "0");
            Datelist.push(`${year}-${month}`);
            startDate.setMonth(startDate.getMonth() + 1);
          }

          // Fetch task request data for duration selected
          const taskrequest_data = (await getTaskRequestActvityTaskRequestId(
            locationId_new,
            activitycode,
            userId,
            Datelist
          )) as TActivityTaskRequestMasterData[];

          // Push into aiFileDatainsert for mappings
          for (let i = 0; i < taskrequest_data.length; i++) {
            const taskid = taskrequest_data[i];
            const isUnique = !combinedTaskRequestData.some(
              (task) => task.taskRequestId === taskid.taskRequestId
            );
            //unique comnination of task req checked
            if (isUnique) {
              combinedTaskRequestData.push(taskrequest_data[i]);
              Taskrequestlist.push(taskid.taskRequestId as UUID);
            }
            aiFileDataInsert.push({
              task_request_id: taskid.taskRequestId,
              activity_task_request_id: taskid.activityTaskRequestId,
              aifileupload_id: fileId,
              created_by: userId as UUID,
              updated_by: userId as UUID,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching grid power deletion data", { error });
        return {
          status: "error",
          message: (error as Error).message || "Unknown error",
        };
      }

      // Step 2: Fetch deletion/updation data (only once)
      try {
        //for fetching current file data for reverify and duration/location changes
        const powerConsumptionData = await getPowerConsumptionData.refetch({
          where: { aifileupload_id: { _eq: fileId } },
        });
        let gridpower_data =
          powerConsumptionData?.data?.AIFileActivityTaskRequestMapping || [];
        //for fetching current file data for reverify and duration/location changes
        const firstDate = new Date(meterData.PreviousReadingDate);
        const lastDate = new Date(meterData.PresentReadingDate);
        const firstDay = new Date(
          firstDate.getFullYear(),
          firstDate.getMonth(),
          1
        );
        const lastDay = new Date(
          lastDate.getFullYear(),
          lastDate.getMonth() + 1,
          0
        );
        //for fetching all files data for the period selected
        const aiFileDataByDates = await getAIFiledatabydate.refetch({
          where: {
            _or: [
              {
                present_reading_date: {
                  _gte: formatDateToLocalISO(new Date(firstDay)),
                  _lte: formatDateToLocalISO(new Date(lastDay)),
                },
              },
              {
                previous_reading_date: {
                  _gte: formatDateToLocalISO(new Date(firstDay)),
                  _lte: formatDateToLocalISO(new Date(lastDay)),
                },
              },
            ],
          },
        });
        //for fetching all files data for the period selected
        gridpower_all_files_data = aiFileDataByDates.data.AIFileData.filter(
          (item: any) =>
            item.AIFileUpload.is_deleted === false &&
            item.AIFileUpload.status === AIFileUploadStatus.Verified &&
            item.id !== filedataId
        );
        //filter to get only verified and active files
        gridpower_current_filedata = gridpower_data.filter(
          (item: any) =>
            item.AIFileUpload.is_deleted === false &&
            item.AIFileUpload.status === AIFileUploadStatus.Verified
        );
        //all manual data will be fetched for this duration on task reqid
        let Grid_manual_data = await getEnergyGriddata.refetch({
          where: { task_request_id: { _in: Taskrequestlist } },
        });
        EnergyGrid_manual_data =
          Grid_manual_data.data.GHGEnergyConsumption_GridPower;

        //units that will be removed after duration changes or location changes from current file
        unwanted_units_data = await checkUnwantedUnitsData(
          gridpower_current_filedata,
          meterData
        );
        if (
          gridpower_current_filedata.length > 0 &&
          unwanted_units_data.length === 0
        ) {
          return {
            status: "success",
            message: "Grid power deletion data fetched successfully",
          };
        }
        //  Continue with removal logic here
      } catch (error) {
        console.error("Error fetching grid power deletion data", { error });
        return {
          status: "error",
          message: (error as Error).message || "Unknown error",
        };
      }

      // Step 3: Get full insertion data
      try {
        const averageUnitsByLocationObject = Object.fromEntries(
          averageUnitsByLocation_new
        );
        //all the units insertion or updation logic will be called in this
        const allData = await gridPowerDetailsInsertionData(
          combinedTaskRequestData,
          userId,
          averageUnitsByLocationObject,
          gridpower_current_filedata,
          gridpower_all_files_data,
          unwanted_units_data,
          EnergyGrid_manual_data
        );
        // insertion or updation objects will be returned
        let whereConditionfilemappings: any[] = [];
        const batchSize = 2000; //records will be insterd/updated on batch size
        const alldatainsert = allData[0].sheetRecord; //data to insert
        const allWhere = _.uniqWith(allData[0].where, _.isEqual);
        const alldataupdate = allData[0].UpdateRecord; //data to update

        // this will create object to remove current file id mapping with taskrequest
        whereConditionfilemappings.push({
          aifileupload_id: { _eq: fileId },
        });
        // this will  remove current file id mapping with taskrequest and insert new
        try {
          await insertAiFileActivityTaskRequestMutation({
            variables: {
              input: aiFileDataInsert,
              where: { _or: whereConditionfilemappings },
            },
          });
        } catch (error) {
          console.error(
            "Error inserting AI File Activity Task Request Mapping:",
            error
          );
          return {
            status: "error",
            message:
              (error as Error).message ||
              "Failed to insert AI File Activity Task Request Mapping",
          };
        }
        // grid table inertion method
        const processBatch = async (
          batch: any[],
          whereBatch: any[],
          alldataupdate: any[]
        ): Promise<any> => {
          // energy grid upsert query
          return await upsertGhgEnergeyGridPowerActivityMutation({
            variables: {
              where: { _or: whereBatch },
              gridPowerdata: batch,
              GHGEnergy_GridPower_update: alldataupdate,
            },
          });
        };
        // grid table inertion method
        const response: any = {
          delete_GHGEnergyConsumption_GridPower: { returning: [] },
          insert_GHGEnergyConsumption_GridPower: { returning: [] },
        };
        // grid table inertion/updation object passing to method
        for (let i = 0; i < alldatainsert.length; i += batchSize) {
          const whereBatch = allWhere.slice(i, i + batchSize);
          const res = await processBatch(
            alldatainsert,
            whereBatch,
            alldataupdate
          );
          // const res = await processBatch([], [], []);
          //inserted  records will be added on tasklist for kpi calculations
          response.insert_GHGEnergyConsumption_GridPower.returning = [
            ...response.insert_GHGEnergyConsumption_GridPower.returning,
            ...(res?.data?.insert_GHGEnergyConsumption_GridPower?.returning ??
              []),
          ];
          //deleted  records will be added on tasklist for kpi calculations
          response.delete_GHGEnergyConsumption_GridPower.returning = [
            ...response.delete_GHGEnergyConsumption_GridPower.returning,
            ...(res?.data?.delete_GHGEnergyConsumption_GridPower?.returning ??
              []),
          ];
          //updated records will be added on tasklist for kpi calculations
          if (
            res?.data?.update_GHGEnergyConsumption_GridPower_many.length > 0
          ) {
            res.data?.update_GHGEnergyConsumption_GridPower_many.map(
              (item: any) => {
                response.insert_GHGEnergyConsumption_GridPower.returning = [
                  ...response.insert_GHGEnergyConsumption_GridPower.returning,
                  // eslint-disable-next-line no-unsafe-optional-chaining
                  ...item?.returning,
                ];
              }
            );
          }
        }
        // grid table updation object passing to method
        if (alldatainsert.length === 0 && alldataupdate.length > 0) {
          for (let i = 0; i < alldataupdate.length; i += batchSize) {
            const batch = alldataupdate.slice(i, i + batchSize);
            const res = await processBatch([], [], alldataupdate);
            //const res = await processBatch([], [], []);
            //updated records will be added on tasklist for kpi calculations
            if (
              res?.data?.update_GHGEnergyConsumption_GridPower_many.length > 0
            ) {
              res.data?.update_GHGEnergyConsumption_GridPower_many.map(
                (item: any) => {
                  response.insert_GHGEnergyConsumption_GridPower.returning = [
                    ...response.insert_GHGEnergyConsumption_GridPower.returning,
                    // eslint-disable-next-line no-unsafe-optional-chaining
                    ...item?.returning,
                  ];
                }
              );
            }
          }
        }

        try {
          await auditLogGHGEnergyConsumptionGridPower({
            data:
              response.insert_GHGEnergyConsumption_GridPower.returning || [],
            userId: userId as UUID,
            deletedData:
              response.delete_GHGEnergyConsumption_GridPower.returning,
            organizationId,
          });
        } catch (error) {
          console.error(
            "Error in auditLogGHGEnergyConsumptionGridPower:",
            error
          );
          return {
            status: "error",
            message:
              (error as Error).message ||
              "Error in auditLogGHGEnergyConsumptionGridPower:",
          };
        }

        try {
          await EmissioncalculationEnergyGrid({
            data: response || [],
            organizationId,
          });
        } catch (error) {
          console.error("Error in EmissioncalculationEnergyGrid:", error);
          return {
            status: "error",
            message:
              (error as Error).message ||
              "Error in EmissioncalculationEnergyGrid",
          };
        }
        return { status: "success", message: "Data inserted successfully" };
      } catch (error) {
        console.error("Error inserting GHG data: ", error);
        return {
          status: "error",
          message: (error as Error).message || "Unknown error",
        };
      }
    },
    [getTaskRequestActvityTaskRequestId]
  );

  type MeterDetail = {
    Location: string; // UUID string, e.g. "bf43afb1-2b9b-401c-989d-7f044074e3ba"
    MeterNumber: string; // e.g. ":2111205UBL511016"
    UnitsConsumed: number; // e.g. 2133.69
  };
  // gridPowerDetailsInsertionData
  const gridPowerDetailsInsertionData = useCallback(
    async (
      taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[], //current task req object on the period
      userId: string,
      Units_data: Record<string, any>, // expected to be a map: { [locationId]: averageUnits }
      CurrentFileGHGdata: any[], // data from getPowerConsumptionData for current file
      GHGAllfiledata: any[], // data from getAIFiledatabydate for other files data
      Oldunitsdata: Record<string, any>, // data from old unwanted units
      Grid_manual_data: Record<string, any> //manual upload data from ghg energy grid tables
    ) => {
      const sheetRecord: GhgEnergyConsumption_GridPower_Insert_Input[] = [];
      const whereCondition: Record<string, any>[] = [];
      const updateData: GhgEnergyConsumption_GridPower_Updates[] = [];
      const taskreqidFile: Record<string, any>[] = [];
      //loop through the task request object
      for (const DataItem of taskRequestActvityTaskRequestData) {
        const targetMonth = getMonthNumberAndIndex(
          DataItem.month.toLowerCase()
        ).monthNumber; // e.g. "jan" -> 1
        const targetYear = Number(DataItem.year);
        //this checks if any existing manual uploaded data
        let task_req_Griddata = null;
        if (Grid_manual_data.length > 0) {
          task_req_Griddata = Grid_manual_data.find((entry: any) => {
            return entry?.task_request_id === DataItem.taskRequestId;
          });
        }

        //matching units for the current task request(month year location)
        const matchingUnits = Units_data[DataItem.organization_address_id];
        if (!matchingUnits?.monthUnitsList) continue;

        const monthlyUnitInfo = matchingUnits.monthUnitsList.find(
          (item: any) => item.month === targetMonth && item.year === targetYear
        );
        if (!monthlyUnitInfo) continue;
        // units to remove
        const unitsToInsert = monthlyUnitInfo.units;
        const isPartial = monthlyUnitInfo.isPartialMonth;

        // units to remove
        let unitsToremove = 0;
        const matchingUnits_remove = Oldunitsdata.find(
          (item: any) => item.locationId === DataItem.organization_address_id
        );
        if (matchingUnits_remove?.monthUnitsList) {
          const monthlyUnitInfo_remove =
            matchingUnits_remove.monthUnitsList.find(
              (item: any) =>
                item.month === targetMonth && item.year === targetYear
            );

          if (monthlyUnitInfo_remove) {
            unitsToremove = monthlyUnitInfo_remove.units;
          }
        }
        //matching units for the current task request(month year location)
        // Check if current file already has GHG energy grid data for this task request and month
        const existingdata = CurrentFileGHGdata.find((entry: any) => {
          return (
            entry.TaskRequest?.month === DataItem.month &&
            entry.TaskRequest?.year === DataItem.year &&
            entry.task_request_id === DataItem.taskRequestId
          );
        });
        if (
          existingdata?.TaskRequest?.GHGEnergyConsumption_GridPowers?.length > 0
        ) {
          // logic to change GHG energy grid data for this task request and month
          const existingdataentry =
            existingdata.TaskRequest.GHGEnergyConsumption_GridPowers[0];
          const ghgId = existingdataentry.id;
          const ghgUnit = existingdataentry.PowerConsumed_through_Grid_Kwh ?? 0;

          // Check if there are units from other files too (to sum)
          let otherFileUnits = 0;

          const matchingOtherFiles = GHGAllfiledata.filter((fileData: any) =>
            fileData?.AIFileUpload?.AIFileActivityTaskRequestMappings?.some(
              (mapping: any) =>
                mapping.task_request_id === DataItem.taskRequestId
            )
          );
          // logic to check other GHG energy grid data for this task request and month
          for (const file of matchingOtherFiles) {
            const mappings =
              file.AIFileUpload.AIFileActivityTaskRequestMappings || [];
            for (const mapping of mappings) {
              if (mapping.task_request_id === DataItem.taskRequestId) {
                const gridPowers =
                  mapping.TaskRequest?.GHGEnergyConsumption_GridPowers || [];
                for (const power of gridPowers) {
                  const extracted =
                    power?.grid_metadata?.AIExtractedData?.Grid_Kwh;
                  if (typeof extracted === "number") {
                    otherFileUnits += extracted;
                  }
                }
              }
            }
          }

          const finalUnits = ghgUnit + unitsToInsert - unitsToremove;

          //ghg data update if data exist in db for month year location
          const exists = updateData.some(
            (item) => item.where?.id?._eq === ghgId
          );
          if (
            !exists &&
            ghgId !== null &&
            ghgId !== undefined &&
            typeof ghgId === "string" &&
            ghgId.trim().length > 0
          ) {
            updateData.push({
              where: { id: { _eq: ghgId } },
              _set: {
                PowerConsumed_through_Grid_Kwh: finalUnits,
                metadata: {
                  AIExtractedData: {
                    Grid_Kwh: finalUnits,
                    task_reqest_id: DataItem.taskRequestId ?? "",
                    activity_task_request_id:
                      DataItem.activityTaskRequestId ?? "",
                    complete_month_entry: isPartial,
                  },
                },
                updated_by: userId,
                updated_at: new Date(),
              },
            });
          }

          const object2TaskRequestIds = new Set(
            taskRequestActvityTaskRequestData.map((item) => item.taskRequestId)
          );

          // Step 2: Filter object1 for task_request_ids not in object2
          const missingTaskRequestIds = CurrentFileGHGdata.filter(
            (item) => !object2TaskRequestIds.has(item.task_request_id)
          );

          if (missingTaskRequestIds.length > 0) {
            //this will add update old entry for ghg enrgy grid
            for (let i = 0; i < missingTaskRequestIds.length; i++) {
              const obj = missingTaskRequestIds[i];
              let unitsRemovedCount = 0;
              if (obj.TaskRequest?.GHGEnergyConsumption_GridPowers.length > 0) {
                const matchingUnits_remove_Count = Oldunitsdata.find(
                  (item: any) =>
                    item.locationId ===
                    obj?.TaskRequest?.organization_address_id
                );

                if (matchingUnits_remove_Count?.monthUnitsList) {
                  const monthlyUnitInfo_removeCount =
                    matchingUnits_remove_Count.monthUnitsList.find(
                      (item: any) =>
                        item.month ===
                          getMonthNumberAndIndex(obj?.TaskRequest?.month)
                            .monthNumber && item.year === obj?.TaskRequest?.year
                    );

                  if (monthlyUnitInfo_removeCount) {
                    unitsRemovedCount = monthlyUnitInfo_removeCount.units;
                  }
                }
                const data =
                  obj.TaskRequest?.GHGEnergyConsumption_GridPowers[0];
                const Id = data.id;
                const Unit = data.PowerConsumed_through_Grid_Kwh ?? 0;

                const finalUnits = Unit - unitsRemovedCount;
                if (finalUnits === 0) {
                  taskreqidFile.push(obj.task_request_id);
                  const exists = updateData.some(
                    (item) => item.where?.id?._eq === Id
                  );
                  //this will add update old entry for ghg enrgy grid units will be 0 and meetadata null
                  if (
                    !exists &&
                    Id !== null &&
                    Id !== undefined &&
                    typeof Id === "string" &&
                    Id.trim().length > 0
                  ) {
                    updateData.push({
                      where: { id: { _eq: Id } },
                      _set: {
                        PowerConsumed_through_Grid_Kwh: finalUnits,
                        metadata: null,
                        updated_by: userId,
                        updated_at: new Date(),
                      },
                    });
                  }
                } else {
                  //this will add update old entry for ghg enrgy grid with units and metadata
                  const exists = updateData.some(
                    (item) => item.where?.id?._eq === Id
                  );

                  if (
                    !exists &&
                    Id !== null &&
                    Id !== undefined &&
                    typeof Id === "string" &&
                    Id.trim().length > 0
                  ) {
                    updateData.push({
                      where: { id: { _eq: Id } },
                      _set: {
                        PowerConsumed_through_Grid_Kwh: finalUnits,
                        metadata: {
                          AIExtractedData: {
                            Grid_Kwh: finalUnits,
                            task_reqest_id: DataItem.taskRequestId ?? "",
                            activity_task_request_id:
                              DataItem.activityTaskRequestId ?? "",
                            complete_month_entry: isPartial,
                          },
                        },
                        updated_by: userId,
                        updated_at: new Date(),
                      },
                    });
                  }
                }
              } else {
                taskreqidFile.push(obj.task_request_id);
              }
            }
          } else {
            //this will fetch other file entry for same range
            const matchingOtherFiles = GHGAllfiledata.filter((fileData: any) =>
              fileData?.AIFileUpload?.AIFileActivityTaskRequestMappings?.some(
                (mapping: any) =>
                  mapping.task_request_id === DataItem.taskRequestId
              )
            );

            if (matchingOtherFiles.length > 0) {
              // Check if there are units from other files too (to add units)
              let otherFileUnits = 0;
              // units to add will be retunred by this loop
              for (const file of matchingOtherFiles) {
                const mappings =
                  file.AIFileUpload.AIFileActivityTaskRequestMappings || [];
                for (const mapping of mappings) {
                  if (mapping.task_request_id === DataItem.taskRequestId) {
                    const gridPowers =
                      mapping.TaskRequest?.GHGEnergyConsumption_GridPowers ||
                      [];
                    for (const power of gridPowers) {
                      const extracted =
                        power?.grid_metadata?.AIExtractedData?.Grid_Kwh;
                      //  ghgEntry = power;
                      if (typeof extracted === "number") {
                        otherFileUnits += extracted;
                      }
                    }
                  }
                }
              }
              // to check other files has data for the task req id in loop
              const filteredTaskRequest =
                matchingOtherFiles[0]?.AIFileUpload?.AIFileActivityTaskRequestMappings?.find(
                  (mapping: any) =>
                    mapping.task_request_id === DataItem.taskRequestId
                )?.TaskRequest;
              if (filteredTaskRequest) {
                const ghgId =
                  filteredTaskRequest?.GHGEnergyConsumption_GridPowers[0]?.id;

                const finalUnits = otherFileUnits + unitsToInsert;
                //units will be added on task req entry after adding other files data

                const exists = updateData.some(
                  (item) => item.where?.id?._eq === ghgId
                );
                if (
                  !exists &&
                  ghgId !== null &&
                  ghgId !== undefined &&
                  typeof ghgId === "string" &&
                  ghgId.trim().length > 0
                ) {
                  //existing data will be updated on unique id and taskrequest
                  updateData.push({
                    where: { id: { _eq: ghgId } },
                    _set: {
                      PowerConsumed_through_Grid_Kwh: finalUnits,
                      metadata: {
                        AIExtractedData: {
                          Grid_Kwh: finalUnits,
                          task_reqest_id: DataItem.taskRequestId ?? "",
                          activity_task_request_id:
                            DataItem.activityTaskRequestId ?? "",
                          complete_month_entry: isPartial,
                        },
                      },
                      updated_by: userId,
                      updated_at: new Date(),
                    },
                  });
                }
              }
            }
          }
        } else {
          // code for period/location changes
          // No existing GHG energy grid record: check other task req
          const object2TaskRequestIds = new Set(
            taskRequestActvityTaskRequestData.map((item) => item.taskRequestId)
          );

          // Step 2: Filter object1 for task_request_ids not in object
          const missingTaskRequestIds = CurrentFileGHGdata.filter(
            (item) => !object2TaskRequestIds.has(item.task_request_id)
          );
          //filter the current file data on task request for period/location changes
          const filteredTaskRequest_currentfileupdate =
            CurrentFileGHGdata.filter(
              (item) => item.task_request_id === DataItem.taskRequestId
            );
          if (missingTaskRequestIds.length > 0) {
            //this will update old entry on task req missing in current filedata
            for (let i = 0; i < missingTaskRequestIds.length; i++) {
              // loop on task req missing in current filedata for units to remove
              const obj = missingTaskRequestIds[i];
              let unitsRemovedCount = 0;
              if (obj.TaskRequest?.GHGEnergyConsumption_GridPowers.length > 0) {
                const matchingUnits_remove_Count = Oldunitsdata.find(
                  (item: any) =>
                    item.locationId ===
                    obj?.TaskRequest?.organization_address_id
                );

                if (matchingUnits_remove_Count?.monthUnitsList) {
                  const monthlyUnitInfo_removeCount =
                    matchingUnits_remove_Count.monthUnitsList.find(
                      (item: any) =>
                        item.month ===
                          getMonthNumberAndIndex(obj?.TaskRequest?.month)
                            .monthNumber && item.year === obj?.TaskRequest?.year
                    );
                  //this will retun the units that will be removed on duraion or llocation changes on current file
                  if (monthlyUnitInfo_removeCount) {
                    unitsRemovedCount = monthlyUnitInfo_removeCount.units;
                  }
                }
                const data =
                  obj.TaskRequest?.GHGEnergyConsumption_GridPowers[0];
                const Id = data.id;
                const Unit = data.PowerConsumed_through_Grid_Kwh ?? 0;

                const finalUnits = Unit - unitsRemovedCount;
                if (finalUnits === 0) {
                  taskreqidFile.push(obj.task_request_id);
                  const exists = updateData.some(
                    (item) => item.where?.id?._eq === Id
                  );
                  //this will update old energy grid entry units will be 0 and medata will be removed
                  if (
                    !exists &&
                    Id !== null &&
                    Id !== undefined &&
                    typeof Id === "string" &&
                    Id.trim().length > 0
                  ) {
                    updateData.push({
                      where: { id: { _eq: Id } },
                      _set: {
                        PowerConsumed_through_Grid_Kwh: finalUnits,
                        metadata: null,
                        updated_by: userId,
                        updated_at: new Date(),
                      },
                    });
                  }
                } else {
                  const exists = updateData.some(
                    (item) => item.where?.id?._eq === Id
                  );
                  //this will update old energy grid entry units with units
                  if (
                    !exists &&
                    Id !== null &&
                    Id !== undefined &&
                    typeof Id === "string" &&
                    Id.trim().length > 0
                  ) {
                    updateData.push({
                      where: { id: { _eq: Id } },
                      _set: {
                        PowerConsumed_through_Grid_Kwh: finalUnits,
                        metadata: {
                          AIExtractedData: {
                            Grid_Kwh: finalUnits,
                            task_reqest_id: DataItem.taskRequestId ?? "",
                            activity_task_request_id:
                              DataItem.activityTaskRequestId ?? "",
                            complete_month_entry: isPartial,
                          },
                        },
                        updated_by: userId,
                        updated_at: new Date(),
                      },
                    });
                  }
                }
              } else {
                taskreqidFile.push(obj.task_request_id);
              }
            }
            //this will add the taskid if the duration and location are changes to new range
            if (filteredTaskRequest_currentfileupdate.length === 0) {
              const taskRequestIdsInSheet = new Set(
                sheetRecord.map((item) => item.task_request_id)
              );
              //this will add new entry on task req missing in current filedata
              const matchingOtherFiles_for_newduration = GHGAllfiledata.filter(
                (fileData: any) =>
                  fileData?.AIFileUpload?.AIFileActivityTaskRequestMappings?.some(
                    (mapping: any) =>
                      mapping.task_request_id === DataItem.taskRequestId
                  )
              );
              if (!taskRequestIdsInSheet.has(DataItem.taskRequestId)) {
                //this checks if any existing manual uploaded data
                if (
                  task_req_Griddata != null &&
                  task_req_Griddata.metadata === null
                ) {
                  //if any existing manual uploaded data then update units
                  let id = task_req_Griddata.id;
                  if (
                    id !== null &&
                    id !== undefined &&
                    typeof id === "string" &&
                    id.trim().length > 0
                  ) {
                    updateData.push({
                      where: { id: { _eq: id } },
                      _set: {
                        PowerConsumed_through_Grid_Kwh: unitsToInsert,
                        metadata: {
                          AIExtractedData: {
                            Grid_Kwh: unitsToInsert,
                            task_reqest_id: DataItem.taskRequestId ?? "",
                            activity_task_request_id:
                              DataItem.activityTaskRequestId ?? "",
                            complete_month_entry: isPartial,
                          },
                        },
                        updated_by: userId,
                        updated_at: new Date(),
                      },
                    });
                  }
                } else if (matchingOtherFiles_for_newduration.length > 0) {
                  // Check if there are units from other files too (to sum)
                  let otherFileUnits = 0;
                  //loop to find units from other files
                  for (const file of matchingOtherFiles_for_newduration) {
                    const mappings =
                      file.AIFileUpload.AIFileActivityTaskRequestMappings || [];
                    for (const mapping of mappings) {
                      if (mapping.task_request_id === DataItem.taskRequestId) {
                        const gridPowers =
                          mapping.TaskRequest
                            ?.GHGEnergyConsumption_GridPowers || [];
                        for (const power of gridPowers) {
                          const extracted =
                            power?.grid_metadata?.AIExtractedData?.Grid_Kwh;
                          //  ghgEntry = power;
                          if (typeof extracted === "number") {
                            otherFileUnits += extracted;
                          }
                        }
                      }
                    }
                  }
                  //filter to check the other files ghg data for taskrequest
                  const filteredTaskRequest_matchingfiles =
                    matchingOtherFiles_for_newduration[0]?.AIFileUpload?.AIFileActivityTaskRequestMappings?.find(
                      (mapping: any) =>
                        mapping.task_request_id === DataItem.taskRequestId
                    )?.TaskRequest;
                  if (filteredTaskRequest_matchingfiles) {
                    //condtiion for taskrequest of other files ghg data
                    const ghgId =
                      filteredTaskRequest_matchingfiles
                        ?.GHGEnergyConsumption_GridPowers[0]?.id;

                    const finalUnits = otherFileUnits + unitsToInsert;
                    //units will be added on task req entry after adding other files data
                    const exists = updateData.some(
                      (item) => item.where?.id?._eq === ghgId
                    );
                    //condtion for updating taskrequest of other files ghg data
                    if (
                      !exists &&
                      ghgId !== null &&
                      ghgId !== undefined &&
                      typeof ghgId === "string" &&
                      ghgId.trim().length > 0
                    ) {
                      // Handle case where 'exists' is false and 'id' is invalid

                      updateData.push({
                        where: { id: { _eq: ghgId } },
                        _set: {
                          PowerConsumed_through_Grid_Kwh: finalUnits,
                          metadata: {
                            AIExtractedData: {
                              Grid_Kwh: finalUnits,
                              task_reqest_id: DataItem.taskRequestId ?? "",
                              activity_task_request_id:
                                DataItem.activityTaskRequestId ?? "",
                              complete_month_entry: isPartial,
                            },
                          },
                          updated_by: userId,
                          updated_at: new Date(),
                        },
                      });
                    }
                  }
                } else {
                  //no existing manual uploaded data for other files then insert
                  sheetRecord.push({
                    task_request_id: DataItem.taskRequestId,
                    organization_address_id: DataItem.organization_address_id,
                    activity_task_request_id: DataItem.activityTaskRequestId,
                    created_by: userId as UUID,
                    updated_by: userId as UUID,
                    PowerConsumed_through_Grid_Kwh: unitsToInsert,
                    metadata: {
                      AIExtractedData: {
                        Grid_Kwh: unitsToInsert,
                        task_reqest_id: DataItem.taskRequestId ?? "",
                        activity_task_request_id:
                          DataItem.activityTaskRequestId ?? "",
                        complete_month_entry: isPartial,
                      },
                    },
                  });
                }
              }
              //this will add new entry on task req missing in current filedata
            }
            //this will add the taskid if the duration and location are changes to new range
          } else {
            //this will fetch other file entry for same range
            const matchingOtherFiles = GHGAllfiledata.filter((fileData: any) =>
              fileData?.AIFileUpload?.AIFileActivityTaskRequestMappings?.some(
                (mapping: any) =>
                  mapping.task_request_id === DataItem.taskRequestId
              )
            );

            if (matchingOtherFiles.length > 0) {
              // Check if there are units from other files too (to sum)
              let otherFileUnits = 0;
              //loop to find units from other files
              for (const file of matchingOtherFiles) {
                const mappings =
                  file.AIFileUpload.AIFileActivityTaskRequestMappings || [];
                for (const mapping of mappings) {
                  if (mapping.task_request_id === DataItem.taskRequestId) {
                    const gridPowers =
                      mapping.TaskRequest?.GHGEnergyConsumption_GridPowers ||
                      [];
                    for (const power of gridPowers) {
                      const extracted =
                        power?.grid_metadata?.AIExtractedData?.Grid_Kwh;
                      //  ghgEntry = power;
                      if (typeof extracted === "number") {
                        otherFileUnits += extracted;
                      }
                    }
                  }
                }
              }
              //filter to check the other files ghg data for taskrequest
              const filteredTaskRequest_matchingfiles =
                matchingOtherFiles[0]?.AIFileUpload?.AIFileActivityTaskRequestMappings?.find(
                  (mapping: any) =>
                    mapping.task_request_id === DataItem.taskRequestId
                )?.TaskRequest;
              if (filteredTaskRequest_matchingfiles) {
                //condtiion for taskrequest of other files ghg data
                const ghgId =
                  filteredTaskRequest_matchingfiles
                    ?.GHGEnergyConsumption_GridPowers[0]?.id;

                const finalUnits = otherFileUnits + unitsToInsert;
                //units will be added on task req entry after adding other files data
                const exists = updateData.some(
                  (item) => item.where?.id?._eq === ghgId
                );
                //condtion for updating taskrequest of other files ghg data
                if (
                  !exists &&
                  ghgId !== null &&
                  ghgId !== undefined &&
                  typeof ghgId === "string" &&
                  ghgId.trim().length > 0
                ) {
                  updateData.push({
                    where: { id: { _eq: ghgId } },
                    _set: {
                      PowerConsumed_through_Grid_Kwh: finalUnits,
                      metadata: {
                        AIExtractedData: {
                          Grid_Kwh: finalUnits,
                          task_reqest_id: DataItem.taskRequestId ?? "",
                          activity_task_request_id:
                            DataItem.activityTaskRequestId ?? "",
                          complete_month_entry: isPartial,
                        },
                      },
                      updated_by: userId,
                      updated_at: new Date(),
                    },
                  });
                }
              }
            } else {
              //no matching files for this duration no current monthdata
              if (
                task_req_Griddata != null &&
                task_req_Griddata.metadata === null
              ) {
                //this checks if any existing manual uploaded data
                let id = task_req_Griddata.id;
                //if any existing manual uploaded data then update units
                if (
                  id !== null &&
                  id !== undefined &&
                  typeof id === "string" &&
                  id.trim().length > 0
                ) {
                  // Execute update logic when id is a valid non-empty string
                  updateData.push({
                    where: { id: { _eq: id } },
                    _set: {
                      PowerConsumed_through_Grid_Kwh: unitsToInsert,
                      metadata: {
                        AIExtractedData: {
                          Grid_Kwh: unitsToInsert,
                          task_reqest_id: DataItem.taskRequestId ?? "",
                          activity_task_request_id:
                            DataItem.activityTaskRequestId ?? "",
                          complete_month_entry: isPartial,
                        },
                      },
                      updated_by: userId,
                      updated_at: new Date(),
                    },
                  });
                }
              } else {
                //no existing manual uploaded data then insert
                sheetRecord.push({
                  task_request_id: DataItem.taskRequestId,
                  organization_address_id: DataItem.organization_address_id,
                  activity_task_request_id: DataItem.activityTaskRequestId,
                  created_by: userId as UUID,
                  updated_by: userId as UUID,
                  PowerConsumed_through_Grid_Kwh: unitsToInsert,
                  metadata: {
                    AIExtractedData: {
                      Grid_Kwh: unitsToInsert,
                      task_reqest_id: DataItem.taskRequestId ?? "",
                      activity_task_request_id:
                        DataItem.activityTaskRequestId ?? "",
                      complete_month_entry: isPartial,
                    },
                  },
                });
              }
            }
          }
        }
      }
      //all insertion/updation objects will be returned
      const excelSheetDataWithGhgId: TSheetGridDataWithId[] = [
        {
          sheetRecord: sheetRecord,
          UpdateRecord: updateData,
          where: whereCondition,
        },
      ];
      return excelSheetDataWithGhgId;
    },
    []
  );

  // average_units_by_date

  function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  function calculateAverageUnitsByMonth(
    fromDateStr: string,
    toDateStr: string,
    totalUnits: number
  ) {
    const fromDate = new Date(fromDateStr);
    const toDate = new Date(toDateStr);

    if (toDate < fromDate) {
      throw new Error("toDate must be after fromDate");
    }

    let monthUnitsList: {
      year: number;
      month: number;
      units: number;
      isPartialMonth: boolean;
    }[] = [];

    let totalDays = 0;
    let monthDaysMap: {
      year: number;
      month: number;
      daysCount: number;
      totalDaysInMonth: number;
    }[] = [];
    let cursor = new Date(fromDate);

    while (
      cursor.getFullYear() < toDate.getFullYear() ||
      (cursor.getFullYear() === toDate.getFullYear() &&
        cursor.getMonth() <= toDate.getMonth())
    ) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth();
      const daysInMonth = getDaysInMonth(year, month);

      let startDay = 1;
      let endDay = daysInMonth;

      if (year === fromDate.getFullYear() && month === fromDate.getMonth()) {
        startDay = fromDate.getDate();
      }

      if (year === toDate.getFullYear() && month === toDate.getMonth()) {
        endDay = toDate.getDate();
      }

      const daysCount = endDay - startDay + 1;
      totalDays += daysCount;

      monthDaysMap.push({
        year,
        month: month + 1, // 1-based
        daysCount,
        totalDaysInMonth: daysInMonth,
      });

      cursor.setDate(1);
      cursor.setMonth(cursor.getMonth() + 1);
    }
    for (const { year, month, daysCount, totalDaysInMonth } of monthDaysMap) {
      const proportion = daysCount / totalDays;
      const units = parseFloat((totalUnits * proportion).toFixed(2));
      const isPartialMonth = daysCount !== totalDaysInMonth;
      monthUnitsList.push({
        year,
        month,
        units,
        isPartialMonth,
      });
    }

    return {
      totalDays,
      monthUnitsList,
    };
  }
  // Utility to get number of days in a month

  // insert_verfied_metermaster_data
  const insertVerifiedMeterMasterData = useCallback(
    async (
      filedataid: string | undefined,
      fileId: string | undefined,
      meterdata: AllMeterDetails,
      userId: string | undefined,
      organizationId: string,
      editedValues: Record<string, any>
    ) => {
      let message = "";
      try {
        if (!userId || !filedataid || !fileId) {
          return { status: "error", message: "Missing required parameters" };
        }

        // Extract all meter numbers from the provided meterdetails
        const meterNumbers = meterdata.MeterDetails.map(
          (meter: any) => meter.MeterNumber
        );

        // Query master table for existing meter numbers
        const meterdataRes = await getMeterOrgAddressMapping.refetch({
          where: { meter_number: { _in: meterNumbers } },
        });

        // Get the list of meter numbers already present in the master table
        const existingMeterNumbers =
          meterdataRes?.data?.MeterOrganizationAddressMapping?.map(
            (item: any) => item.meter_number
          ) || [];

        // Filter out meter details that are NOT present in the master table
        const metersToInsert = meterdata.MeterDetails.filter(
          (meter: any) => !existingMeterNumbers.includes(meter.MeterNumber)
        );
        // Prepare insert payload for missing meter-organization address mappings
        const meterOrgAddressMappingData = metersToInsert.map((meter: any) => ({
          meter_number: meter.MeterNumber,
          filedata_id: filedataid,
          organization_address_id: isUUID(meter.LocationId)
            ? meter.LocationId
            : null,
          updated_by: userId,
          created_by: userId,
        }));
        // Remove duplicates from meterOrgAddressMappingData first
        const uniqueMeterOrgAddressMappingData =
          meterOrgAddressMappingData.filter(
            (item, index, self) =>
              index ===
              self.findIndex(
                (t) =>
                  t.meter_number === item.meter_number &&
                  t.organization_address_id === item.organization_address_id
              )
          );

        // Insert missing meter-organization address mappings one by one
        if (uniqueMeterOrgAddressMappingData.length > 0) {
          for (const meterMapping of uniqueMeterOrgAddressMappingData) {
            try {
              await insertMeterOrgAddressMappingMutation({
                variables: { input: [meterMapping] },
              });
            } catch (error) {
              message = (error as Error).message || "Unknown error";
              console.error(
                `Failed to insert meter mapping for ${meterMapping.meter_number}`
              );
            }
          }
        }
        const existingMeterfilemappings =
          meterdataRes.data.MeterOrganizationAddressMapping.flatMap((mapping) =>
            mapping.MeterData.map((md: any) => ({
              meter_number: md.meter_number,
              filedata_id: md.filedata_id,
              id: md.id,
            }))
          );
        // Filter out existing records from meterdetails
        const filteredMeterfileDetails = meterdata.MeterDetails.filter(
          (meter: any) => {
            return !existingMeterfilemappings.some(
              (existing) =>
                existing.meter_number === meter.MeterNumber &&
                existing.filedata_id === filedataid // assume filedataid is in scope
            );
          }
        );
        //---------- MeterData Deletion starts ---------------
        const existingMeterDataRes = await getMeterDataByFileId.refetch({
          filedata_id: filedataid,
        });
        const currentMeterNumbers = meterdata.MeterDetails.map(
          (m: any) => m.MeterNumber
        );
        // Find meters that are in the existing data (DB) but not in the current file
        const metersToDelete = existingMeterDataRes?.data?.MeterData.filter(
          (existing: any) =>
            !currentMeterNumbers.includes(existing.meter_number)
        );
        // Delete removed meters using bulk delete
        if (metersToDelete.length > 0) {
          const deleteIds = metersToDelete.map((m) => m.id);
          try {
            const deleteResponse = await deleteMeterData({
              variables: { ids: deleteIds },
            });
            // Add audit log for deleted meters
            await auditLogMeterData({
              data: [],
              userId: userId as UUID,
              deletedData:
                deleteResponse?.data?.delete_MeterData?.returning || [],
              organizationId: organizationId,
            });
          } catch (error) {
            console.error("Failed to delete meter data:", error);
            message = `Failed to delete some meter records: ${(error as Error).message}`;
          }
        }
        //---------- MeterData Deletion ends ---------------

        //----------- MeterData Insertion starts ---------------
        const metersToUpdate = filteredMeterfileDetails.filter(
          (meter: any) => meter.id
        );
        const metersToBeInserted = filteredMeterfileDetails.filter(
          (meter: any) => !meter.id
        );
        // Handle updates for existing MeterData records
        for (const meter of metersToUpdate) {
          await updateMeterData({
            variables: {
              id: meter.id,
              set: {
                meter_number: meter.MeterNumber,
                organization_address_id: meter.LocationId,
                average_units_consumed: meter.UnitsConsumed,
                updated_by: userId,
              },
            },
          });
        }

        // Prepare insert payload for inserting new meter data in MeterData
        const meterData: MeterData_Insert_Input[] = metersToBeInserted.map(
          (meter: any) => ({
            meter_number: meter.MeterNumber,
            filedata_id: filedataid,
            organization_address_id: meter.LocationId,
            average_units_consumed: meter.UnitsConsumed,
            created_by: userId,
            updated_by: userId,
          })
        );

        //Insert only if there are new meters to add
        if (meterData.length > 0) {
          let responsemeterDataInsert = await insertMeterDataMutation({
            variables: { input: meterData },
          });
          //Click house entry --add MeterData logs;
          await auditLogMeterData({
            data:
              responsemeterDataInsert?.data?.insert_MeterData?.returning || [],
            userId: userId as UUID,
            deletedData: [],
            organizationId: organizationId,
          });
        }
        //----------- MeterData Insertion ends ---------------
        await updateVerifiedAiFileData(
          filedataid,
          fileId,
          editedValues,
          userId,
          organizationId,
          meterdata
        );
        return {
          status: "success",
          message: "Meter master data inserted successfully",
        };
      } catch (error: unknown) {
        console.error("meter master insertion failed", { error: error });
        message = (error as Error).message || "Unknown error";
        return {
          status: "error",
          message: message,
        };
      }
    },
    [getMeterOrgAddressMapping, insertMeterDataMutation]
  );

  // update_verfied_aifiledata
  const updateVerifiedAiFileData = useCallback(
    async (
      fileDataId: string,
      fileId: string,
      editedValues: Record<string, any>,
      userid: string,
      organizationId: string,
      meterdetails: AllMeterDetails
    ) => {
      try {
        // Update AIFileUploads status and metadata
        let responsedata = await updateAiFileUploadMutation({
          variables: {
            where: { id: { _in: [fileId] } },
            set: {
              status: AIFileUploadStatus.Verified,
              updated_at: new Date().toISOString(),
              updated_by: userid,
            },
          },
        });
        //Click house entry --add AIFileUploads logs
        console.info(
          "Calling Autit log for FileUpload from useAiFileData hook"
        );
        await auditLogFileUpload({
          data: responsedata?.data?.update_AIFileUploads?.returning || [],
          userId: userid as UUID,
          deletedData: [],
        });
        // Update AIFileData with edited values and verification info
        const prevdate = formatDateToLocalISO(
          new Date(meterdetails.PreviousReadingDate)
        );
        const presdate = formatDateToLocalISO(
          new Date(meterdetails.PresentReadingDate)
        );
        let response = await updateAiFileDataMutation({
          variables: {
            where: { id: { _in: [fileDataId] } },
            set: {
              edited_values: editedValues,
              previous_reading_date: prevdate,
              present_reading_date: presdate,
              verified_at: new Date().toISOString(),
              verified_by: userid,
              updated_by: userid,
              updated_at: new Date().toISOString(),
            },
          },
        });
        //click house entry --add AIFileUploads logs
        console.info("Calling Autit log for FileData from useAiFileData hook");
        await auditLogFileData({
          data: response?.data?.update_AIFileData?.returning || [],
          userId: userid as UUID,
          deletedData: [],
          organizationId: organizationId,
        });
        return {
          status: "success",
          message: "AI file data updated successfully",
        };
      } catch (error: unknown) {
        console.error("Step AIFiledata update: AIFiledata update failed", {
          error: error,
        });
        return {
          status: "error",
          message: (error as Error)?.message || "Unknown error",
        };
      }
    },
    [updateAiFileUploadMutation, updateAiFileDataMutation]
  );
  return {
    getTaskRequestActvityTaskRequestId,
    insertVerifiedDataGhgTables,
    gridPowerDetailsInsertionData,
    insertVerifiedMeterMasterData,
    updateVerifiedAiFileData,
  };
}
