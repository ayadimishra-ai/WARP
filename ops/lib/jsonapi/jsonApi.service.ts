import { UUID } from "crypto";
import * as _ from "lodash";
import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  ActivityTaskRequest_Insert_Input,
  TaskRequest_Insert_Input,
} from "~/graphql/shared/types";
import { addressTypeAllowedActivity } from "~/shared/constants/input.constant";
import { months, short_months } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";
import { TUserSession } from "../auth/auth.client";
import { toTitleCase } from "../shared/constants/input.constant";

export const YearMonthSchemaForApi = (baseYear: number) =>
  z.object({
    year: z
      .number()
      .refine((val) => {
        const value = Number(sanitizeString.v1(String(val)));
        return value >= baseYear && value <= new Date().getFullYear();
      }, "Invalid year")
      .transform((val) => Number(sanitizeString.v2(String(val)))),
    month: z
      .string()
      .refine(
        (value) => {
          let fullNameMonth = months.filter(
            (monthItem) =>
              sanitizeString.v3(monthItem) == sanitizeString.v3(value)
          );
          let shortNameMonth = short_months.filter(
            (monthItem) =>
              sanitizeString.v3(monthItem) == sanitizeString.v3(value)
          );
          if (fullNameMonth.length == 0 && shortNameMonth.length == 0) {
            return false;
          }
          return true;
        },
        (val) => ({
          message: "Invalid month",
        })
      )
      .transform((val) => sanitizeString.v3(String(val))),
  });

export type TinputBodyData = {
  year: number;
  month: string;
};
export type materialTypeProcured = {
  label: string;
  value: number;
  UOM: string;
  category: string;
  month: string;
  activitytask_request_id: UUID;
  year: number;
};
export const getTaskRequestActvityTaskRequestIdforAPI = async (
  org_address_id: UUID,
  apiData: TinputBodyData[],
  activitycode: string,
  userSession: TUserSession
) => {
  const monthYearlist: Record<string, any>[] = [];
  const finalYearMonth: Record<string, any>[] = [];
  const whereCondition: Record<string, any>[] = [];
  const activityTaskRequestWhereRequest: Record<string, any>[] = [];
  const sdk = await getGraphQlServerSDK();
  const AddressData = await sdk.getAddressDetail({
    organisationAddressId: org_address_id,
  });
  const allactivityMasterIdList: string[] = [];
  const allprocuredlocationMasterIdList: string[] = [];
  apiData?.forEach((inputData: Record<string, any>) => {
    allactivityMasterIdList.push(inputData.activity_location_master_id);
    if (!!inputData.destination_locations) {
      inputData.destination_locations.forEach(
        (item1: { destination_location_master_id: string }) =>
          allprocuredlocationMasterIdList.push(
            item1.destination_location_master_id
          )
      );
    }
    if (!!inputData.procured_from_locations) {
      inputData.procured_from_locations.forEach(
        (item1: { procured_location_master_id: string }) =>
          allprocuredlocationMasterIdList.push(
            item1.procured_location_master_id
          )
      );
    }
  });
  const locationdetails = await sdk.gettransportupstreamlocationdata({
    materialmasterid: [],
    procuredlocationmasterid: allprocuredlocationMasterIdList,
    activitylocationmasterid: allactivityMasterIdList,
  });
  const addresstype = addressTypeAllowedActivity.filter(
    (item: Record<string, any>) =>
      sanitizeString.v1(item.name) ==
      sanitizeString.v1(AddressData.OrganizationAddress[0].Address.type ?? "")
  );
  const allowedactivity = addresstype[0].data.filter(
    (item: Record<string, any>) =>
      sanitizeString.v1(item.name) ==
      sanitizeString.v1(
        AddressData.OrganizationAddress[0].Address.ownership_type ?? ""
      )
  )[0].data;

  const activityData = await sdk.getActivitybycode({
    activitycode: allowedactivity,
  });

  const currentActivityId = activityData?.Activity.filter(
    (item: any) =>
      sanitizeString.v1(item.code) == sanitizeString.v1(activitycode)
  )[0].id;

  apiData?.forEach((inputData: any) => {
    const activitylocationdetails =
      locationdetails?.activitylocationaddress?.filter(
        (item1) =>
          item1.client_master_id == inputData.activity_location_master_id
      );
    monthYearlist.push({
      year: inputData.year,
      month: inputData.month,
      Combination: inputData.year + "" + inputData.month,
      org_address_id: activitylocationdetails[0]?.OrganizationAddresses[0]?.id,
    });
  });
  let grouped_data = _.groupBy(monthYearlist, "Combination");
  Object.keys(grouped_data).map((item: any) => {
    let keydata = grouped_data[item];
    keydata.forEach((items) => {
      const monthYearData = finalYearMonth.filter(
        (x: any) =>
          x.year == items.year &&
          x.month == x.month &&
          items.organization_address_id
      );
      if (!monthYearData.length) {
        finalYearMonth.push({
          year: items.year,
          month: items.month,
          organization_address_id: items?.org_address_id,
        });
        whereCondition.push({
          _and: {
            year: { _eq: items.year },
            month: { _eq: items.month },
            organization_address_id: { _eq: items?.org_address_id },
          },
        });
      }
    });
  });
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
          organization_address_id: item?.organization_address_id,
          activity_id: currentActivityId,
          task_request_id: item?.id,
          created_by: userSession.userId as UUID,
          updated_by: userSession.userId as UUID,
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
              location_name: item.OrganizationAddress.Address.name,
              pincode: item.OrganizationAddress.Address.pincode,
            });
          }
        );
      }
    });
  }

  if (leftoutActivityTaskRequestData.length > 0) {
    const pendingActivityTaskreuqestdata = await sdk.InsertActivityTaskRequest({
      input: leftoutActivityTaskRequestData,
    });
    if (!!pendingActivityTaskreuqestdata) {
      pendingActivityTaskreuqestdata.insert_ActivityTaskRequest?.returning.forEach(
        (activityitem) => {
          activityTaskRequestWhereRequest.push({
            _and: {
              organization_address_id: {
                _eq: activityitem.organization_address_id,
              },
              activity_id: { _eq: activityitem.activity_id },
              task_request_id: { _eq: activityitem.task_request_id },
            },
          });
        }
      );
    }
  }

  const insertionTaskRequestData = monthYearlist?.filter(
    (obj1) =>
      !TaskRequest.some(
        (obj2) => obj1.month === obj2.month && obj1.year === obj2.year
      )
  ) as Record<string, any>[];

  //insert into Task Request Table Starts
  const taskRequestObj: TaskRequest_Insert_Input[] = [];
  insertionTaskRequestData.map((taskInput: Record<string, any>) => {
    monthYearlist
      .filter(
        (item) => item.month == taskInput.month && item.year == taskInput.year
      )
      .forEach((items) => {
        taskRequestObj.push({
          organization_address_id: items.org_address_id,
          month: toTitleCase(taskInput.month),
          year: taskInput.year,
          created_by: userSession.userId as UUID,
          updated_by: userSession.userId as UUID,
        });
      });
  });
  const UniqtaskRequestObj = _.uniqWith(taskRequestObj, _.isEqual);

  const taskRequestInsert = await sdk.InsertTaskRequest({
    input: UniqtaskRequestObj,
  });
  //insert into Task Request Table Ends

  //insert into Activity Task Request Table Starts
  const ActivityTaskRequestDataCombination: Record<string, UUID>[] = [];
  taskRequestInsert?.insert_TaskRequest?.returning.map((taskid) => {
    activityData.Activity.map((activityitem) => {
      ActivityTaskRequestDataCombination.push({
        organization_address_id: taskid?.organization_address_id,
        activity_id: activityitem.id,
        task_request_id: taskid?.id,
        created_by: userSession.userId as UUID,
        updated_by: userSession.userId as UUID,
      });
      activityTaskRequestWhereRequest.push({
        _and: {
          organization_address_id: { _eq: taskid?.organization_address_id },
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
          organization_address_id: activitytaskitem.organization_address_id,
          month: activitytaskitem.TaskRequest.month,
          year: activitytaskitem.TaskRequest.year,
          activityTaskRequestId: activitytaskitem.id,
          location_name: activitytaskitem.OrganizationAddress.Address.name,
          pincode: activitytaskitem.OrganizationAddress.Address.pincode,
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
          location_name:
            activityTaskFiltereditem.OrganizationAddress.Address.name,
          pincode: activityTaskFiltereditem.OrganizationAddress.Address.pincode,
        });
      });
  });
  return foreignKeyInsertionObject;
};
