import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  ActivityTaskRequest_Insert_Input,
  AiFileActivityTaskRequestMapping_Insert_Input,
  GhgEnergyConsumption_GridPower_Insert_Input,
  MeterData_Insert_Input,
  MeterOrganizationAddressMapping_Insert_Input,
  TaskRequest_Insert_Input,
} from "~/graphql/shared/types";
import { AIFileUploadStatus } from "~/shared/constants/ai-constant";
import { addressTypeAllowedActivity } from "~/shared/constants/input.constant";
import { getMonthName } from "~/utils/date.util";
import { logger } from "~/utils/logger";
import { sanitizeString, toSentenceCase } from "~/utils/sanitize.util";
import { logAIFileuploadChange } from "../auditlog/auditlog.service";
import {
  TActivityTaskRequestMasterData,
  TSheetDataWithId,
} from "../excel/excel.service";
import { toTitleCase } from "../shared/constants/input.constant";

export const getTaskRequestActvityTaskRequestId_ai = async (
  org_address_id: UUID,
  filedata: any,
  activitycode: string,
  userId: String
) => {
  //  const sdk = await getServerSDK(userSession.organizationId);
  const sdk = await getGraphQlServerSDK();
  const monthYearlist: Record<string, any>[] = [];
  const finalYearMonth: Record<string, any>[] = [];
  const whereCondition: Record<string, any>[] = [];
  const activityTaskRequestWhereRequest: Record<string, any>[] = [];
  //get addressid
  const AddressData = await sdk.getAddressDetail({
    organisationAddressId: org_address_id,
  });

  //get type
  const addresstype = addressTypeAllowedActivity.filter(
    (item: Record<string, any>) =>
      sanitizeString.v1(item.name) ==
      sanitizeString.v1(AddressData.OrganizationAddress[0].Address.type ?? "")
  );
  //check allowed activities
  const allowedactivity = addresstype[0]?.data?.filter(
    (item: Record<string, any>) =>
      sanitizeString.v1(item.name) ==
      sanitizeString.v1(
        AddressData.OrganizationAddress[0].Address.ownership_type ?? ""
      )
  )[0].data;
  //get activitie data
  const activityData = await sdk.getActivitybycode({
    activitycode: allowedactivity,
  });
  //check current activity id
  const currentActivityId = activityData?.Activity.filter(
    (item: any) =>
      sanitizeString.v1(item.code) == sanitizeString.v1(activitycode)
  )[0].id;
  //get month year list
  filedata?.forEach((inputData: any) => {
    const date = new Date(inputData.PresentReadingDate);
    const month = date.getMonth() + 1; // Months are 0-indexed (0 = Jan, 9 = Oct)
    const year = date.getFullYear();
    const monthname = getMonthName(month);

    if (year && monthname)
      monthYearlist.push({
        Year: year,
        Month: toSentenceCase(monthname),
        Combination: year + "" + toSentenceCase(monthname),
      });
    const _ = require("lodash");
    let grouped_data = _.groupBy(monthYearlist, "Combination");
    //get month year list
    Object.keys(grouped_data).map((item: any) => {
      let keydata = grouped_data[item];
      if (
        keydata.length > 0 &&
        finalYearMonth.filter(
          (x: any) => x.year == keydata[0].Year && x.month == keydata[0].Month
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
  //get task request list
  const { TaskRequest } = await sdk.gettaskRequest({
    where: { _or: whereCondition },
    activityId: currentActivityId,
  });
  const leftoutActivityTaskRequestData: Record<string, UUID>[] = [];
  const foreignKeyInsertionObject: Record<string, any>[] = [];
  if (!!TaskRequest && TaskRequest.length > 0) {
    TaskRequest.forEach((item: Record<string, any>) => {
      if (item.ActivityTaskRequests.length == 0) {
        leftoutActivityTaskRequestData.push({
          organization_address_id: org_address_id,
          activity_id: currentActivityId,
          task_request_id: item?.id,
          created_by: userId as UUID,
          updated_by: userId as UUID,
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
  //get new task request list
  if (leftoutActivityTaskRequestData.length > 0) {
    const pendingActivityTaskreuqestdata = await sdk.InsertActivityTaskRequest({
      input: leftoutActivityTaskRequestData,
    });
    //get new task request list
    if (!!pendingActivityTaskreuqestdata) {
      pendingActivityTaskreuqestdata.insert_ActivityTaskRequest?.returning.forEach(
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
  }
  //insertobject new task request list
  const insertionTaskRequestData = monthYearlist?.filter(
    (obj1) =>
      !TaskRequest.some(
        (obj2) => obj1.Month === obj2.month && obj1.Year === obj2.year
      )
  ) as Record<string, any>[];
  //insert into Task Request Table Starts
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
  const UniqtaskRequestObj = _.uniqWith(taskRequestObj, _.isEqual);

  const taskRequestInsert = await sdk.InsertTaskRequest({
    input: UniqtaskRequestObj,
  });
  //  insert into Task Request Table Ends

  //insert into Activity Task Request Table Starts
  const ActivityTaskRequestDataCombination: Record<string, UUID>[] = [];
  taskRequestInsert?.insert_TaskRequest?.returning.map((taskid) => {
    activityData.Activity.map((activityitem) => {
      ActivityTaskRequestDataCombination.push({
        organization_address_id: org_address_id,
        activity_id: activityitem.id,
        task_request_id: taskid?.id,
        created_by: userId as UUID,
        updated_by: userId as UUID,
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
  const activityTaskMasterData = await sdk.getactivityTaskRequestData({
    where: { _or: activityTaskRequestWhereRequest },
  });
  const activityTaskRequestobj = ActivityTaskRequestDataCombination?.filter(
    (obj1) =>
      !activityTaskMasterData.ActivityTaskRequest.some(
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
      activityTaskMasterData.ActivityTaskRequest.forEach((activitytaskitem) => {
        foreignKeyInsertionObject.push({
          taskRequestId: activitytaskitem.task_request_id,
          organization_address_id: org_address_id,
          month: activitytaskitem.TaskRequest.month,
          year: activitytaskitem.TaskRequest.year,
          activityTaskRequestId: activitytaskitem.id,
        });
      });
    }
  }

  const ActivityTaskreuqestdata = await sdk.InsertActivityTaskRequest({
    input: activityTaskRequestobj,
  });
  //insert into Activity Task Request Table Ends

  taskRequestInsert?.insert_TaskRequest?.returning.forEach((item) => {
    ActivityTaskreuqestdata?.insert_ActivityTaskRequest?.returning
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
};

export const insert_verfied_data_ghg_tables = async (
  org_address_id: UUID,
  fileid: UUID,
  filedata: any,
  activitycode: string,
  userId: string
) => {
  const sdk = await getGraphQlServerSDK();
  //get or create task request id on data
  let taskrequest_data = (await getTaskRequestActvityTaskRequestId_ai(
    org_address_id,
    filedata,
    activitycode,
    userId
  )) as TActivityTaskRequestMasterData[];
  //get or create task request id on data
  const batchSize = 2000; // Define your batch size
  //get power consumption data from task request id on data
  const powerConsumptionData: any = await sdk.getPowerConsumptionData({
    task_request_id: taskrequest_data[0].taskRequestId,
  });
  if (powerConsumptionData.GHGEnergyConsumption_GridPower.length > 0) {
    let gridpower_data = powerConsumptionData.GHGEnergyConsumption_GridPower[0];
    //get power consumption data from task request id on data
    //check power consumption data insertion manual/ai
    // let ai_inserted_grid_data = gridpower_data;
    // if (!!ai_inserted_grid_data.metadata) {
    // }
  }

  // power consumption data insertion ai object
  const allData = await GridPowerDetailsInsertionData_ai(
    filedata,
    taskrequest_data,
    userId
  );
  const allWhere = _.uniqWith(allData[0].where, _.isEqual);
  // power consumption data insertion ai object

  const processBatch = async (
    batch: any[],
    whereBatch: any[]
  ): Promise<any> => {
    return await sdk.upsertGHGEnergy_GridPowerActivity({
      where: { _or: whereBatch },
      gridPowerdata: batch,
      GHGEnergy_GridPower_update: [],
    });
  };
  const response: any = {
    delete_GHGEnergyConsumption_GridPower: {
      returning: [],
    },
    insert_GHGEnergyConsumption_GridPower: {
      returning: [],
    },
  };

  for (let i = 0; i < allData.length; i += batchSize) {
    const batch = allData[0].sheetRecord;
    const whereBatch = allWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch);
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_GHGEnergyConsumption_GridPower.returning = [
      ...response.insert_GHGEnergyConsumption_GridPower.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_GHGEnergyConsumption_GridPower?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_GHGEnergyConsumption_GridPower.returning = [
      ...response.delete_GHGEnergyConsumption_GridPower.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_GHGEnergyConsumption_GridPower?.returning,
    ];
  }

  //insert ai task req data
  const aiFileData: AiFileActivityTaskRequestMapping_Insert_Input[] = [];
  aiFileData.push({
    task_request_id: taskrequest_data[0].taskRequestId,
    activity_task_request_id: taskrequest_data[0].activityTaskRequestId,
    aifileupload_id: "",
    created_by: userId as UUID,
  });
  const AIFileActivityInsertTaskRequest =
    await sdk.AIFileActivityInsertTaskRequest({
      input: aiFileData,
      where: {},
    });
  //insert ai task req data
  return response;
};

export const GridPowerDetailsInsertionData_ai = async (
  filedata: any,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userId: string
) => {
  const sheetRecord: GhgEnergyConsumption_GridPower_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];

  filedata.forEach((DataItem: any) => {
    const date = new Date(DataItem.PresentReadingDate);
    const month = date.getMonth() + 1; // Months are 0-indexed (0 = Jan, 9 = Oct)
    const year = date.getFullYear();
    const monthname = getMonthName(month);
    let metadata: Record<string, any> = {
      AIExtractedData: [],
    };
    let ActivityTaskData = taskRequestActvityTaskRequestData.filter(
      (dataitem: Record<string, any>) =>
        sanitizeString.v1(dataitem.month) == sanitizeString.v1(monthname) &&
        dataitem.year == year
    );
    if (ActivityTaskData.length > 0) {
      whereCondition.push({
        _and: {
          task_request_id: { _eq: ActivityTaskData[0].taskRequestId },
          organization_address_id: {
            _eq: ActivityTaskData[0].organization_address_id,
          },
          activity_task_request_id: {
            _eq: ActivityTaskData[0].activityTaskRequestId,
          },
        },
      });
      sheetRecord.push({
        task_request_id: ActivityTaskData[0].taskRequestId,
        organization_address_id: ActivityTaskData[0].organization_address_id,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
        Name_of_Distribution_Company: sanitizeString.v2(
          DataItem["Name of Distribution Company"]
        ),
        PowerConsumed_through_Grid_Kwh: parseFloat(
          DataItem.MeterDetails[0].UnitsConsumed
        ),
        NameOfCompany_PPA_Renewable: sanitizeString.v2(
          DataItem["PPA Company Name - Renewable"]
        ),
        PowerPurchased_through_PPA_Kwh_Renewable: parseFloat(
          sanitizeString.v2(
            String(DataItem["Units of Renewable power - PPA (in Kwh)"])
          )
        ),
        created_by: userId as UUID,
        updated_by: userId as UUID,
        metadata: {
          AIExtractedData: {
            Grid_Kwh: DataItem.MeterDetails[0].UnitsConsumed,
            task_reqest_id: ActivityTaskData[0]?.taskRequestId ?? "",
            activity_task_request_id:
              ActivityTaskData[0]?.activityTaskRequestId ?? "",
          },
        },
      });
    }
  });
  const excelSheetDataWithGhgId: TSheetDataWithId[] = [
    {
      sheetRecord: sheetRecord,
      where: whereCondition,
    },
  ];
  return excelSheetDataWithGhgId;
};

export const average_units_by_date = async (
  fromdate: string,
  todate: string
) => {
  let unitsPerDay;
  try {
    // const sdk = await getServerSDK(userSession.organizationId);
    const sdk = await getGraphQlServerSDK();
    let filedata = await sdk.GetAIFiledatabydate({
      where: {
        previous_reading_date: {
          _gte: fromdate,
        },
        present_reading_date: {
          _lte: todate,
        },
      },
    });
    //    return filedata.AIFileData;
    filedata.AIFileData.map((reading: any) => {
      const {
        id,
        extracted_values,
        edited_values,
        present_reading_date,
        previous_reading_date,
      } = reading;
      const units =
        edited_values != null && edited_values != undefined
          ? edited_values.MeterDetails[0]?.UnitsConsumed || 0
          : extracted_values.MeterDetails[0]?.UnitsConsumed || 0;
      const startDate = new Date(previous_reading_date);
      const endDate = new Date(present_reading_date);
      const timeDiff = endDate.getTime() - startDate.getTime();
      const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

      unitsPerDay = days > 0 ? (units / days).toFixed(2) : 0;
    });
    return unitsPerDay;
  } catch (error) {}
};

export const insert_verfied_metermaster_data = async (
  filedataid: string | undefined,
  meterdetails: any,
  userId: string | undefined,
  average_units_consumed: string | any
) => {
  try {
    if (!userId || !filedataid) {
      return;
    }

    const ExtractedData: Record<string, UUID>[] = [];
    // const sdk = await getServerSDK(userSession.organizationId);
    const sdk = await getGraphQlServerSDK();
    const meterIds = meterdetails.meters.map((meter: any) => meter.MeterNumber);
    let meterdata = await sdk.GetMeterOrganizationAddressMapping({
      where: {
        meter_number: {
          _in: meterIds,
        },
      },
    });
    ////mapping creation for address start
    const filteredMappedMeters = meterdata.MeterOrganizationAddressMapping.map(
      (meter) => {
        if (meterIds.includes(meter.meter_number)) {
          return meter; // ✅ Include only if present in comparison list
        }
        return null;
      }
    ).filter(Boolean);

    if (filteredMappedMeters.length > 0) {
      const aiFileData: MeterOrganizationAddressMapping_Insert_Input[] = [];
      //      filteredMappedMeters.forEach((item: Record<string, any>) => {
      //filteredMappedMeters loop and check
      aiFileData.push({
        meter_number: meterIds[0],
        organization_address_id: meterIds[0].addressid,
        created_by: userId,
        filedata_id: filedataid,
      });
      //  })
      const responseMeterOrganizationAddressMappingInsert =
        await sdk.InsertMeterOrganizationAddressMappingData({
          input: aiFileData,
        });
    }
    ////mapping creation for address end
    const meterData: MeterData_Insert_Input[] = [];
    meterData.push({
      meter_number: meterIds[0],
      filedata_id: filedataid,
      organization_address_id: meterIds[0].addressid,
      average_units_consumed: average_units_consumed,
      created_by: userId,
    });
    const responsemeterDataInsert = await sdk.InsertMeterData({
      input: meterData,
    });

    //   logAImeterdata(responsemeterDataInsert, userId as UUID, []);

    ////MeterData insertion
    update_verfied_aifiledata(filedataid, meterdetails, userId);
    //insert ghg data
    // insert_verfied_data_ghg_tables(
    //   meterIds[0].addressid,
    //   filedataid as UUID,
    //   meterdetails,
    //   GridPowerDetailsConstant.parent_code,
    //   userId as UUID
    // );
    //insert ghg data
    //click house entry --add meter data logs
  } catch (error: unknown) {
    logger.error("meter master insertion failed", {
      error: error,
    });
  }
};

export const update_verfied_aifiledata = async (
  fileid: string | null,
  aifiledata: any,
  userid: string | undefined
) => {
  try {
    // const sdk = await getServerSDK(userSession.organizationId);
    const sdk = await getGraphQlServerSDK();
    //update AIFileUploads status to verified
    let responsedata = await sdk.UpdateAIFileUploads({
      where: { id: { _in: [fileid] } },
      set: {
        status: AIFileUploadStatus.Verified,
        updated_at: new Date().toISOString(),
        updated_by: userid,
      },
    });

    logAIFileuploadChange(responsedata, userid as UUID, []);
    //update AIFileUploads status to verified
    let response = await sdk.UpdateAIFileData({
      where: { file_id: { _in: [fileid] } },
      set: {
        edited_values: aifiledata[0],
        verified_at: new Date().toISOString(),
        verified_by: userid,
      },
    });
    //  debugger;
    //click house entry --add AIFileUploads logs
    //logAIFiledataChange(response, userid as UUID, []);
  } catch (error: unknown) {
    logger.error("Step AIFiledata update: AIFiledata update failed", {
      error: error,
    });
  }
};
