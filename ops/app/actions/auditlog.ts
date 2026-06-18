"use server";

import { UUID } from "crypto";
import { logger } from "~/utils/logger";
import {
  logAIFiledataChange,
  logAIFileuploadChange,
  logAImeterdata,
  saveGHGEnergyConsumptionGridPower,
} from "../../lib/auditlog/auditlog.service";

// Server action to log AI file data, meter data, or file upload changes

export async function auditLogFileData({
  data,
  userId,
  deletedData = null,
  organizationId,
}: {
  data: any;
  userId: string;
  deletedData?: any;
  organizationId: string;
}) {
  return await logAIFiledataChange(data, userId, deletedData, organizationId);
}

export async function auditLogMeterData({
  data,
  userId,
  deletedData = null,
  organizationId,
}: {
  data: any;
  userId: string;
  deletedData?: any;
  organizationId: string;
}) {
  return await logAImeterdata(data, userId, deletedData, organizationId);
}

export async function auditLogFileUpload({
  data,
  userId,
  deletedData = null,
}: {
  data: any;
  userId: string;
  deletedData?: any;
}) {
  return await logAIFileuploadChange(data, userId, deletedData);
}

export async function auditLogGHGEnergyConsumptionGridPower({
  data,
  userId,
  deletedData = null,
  organizationId,
}: {
  data: any;
  userId: string;
  deletedData?: any;
  organizationId: string;
}) {
  logger.debug("All GHGEnergyConsumptionGridPower mapped", { allData: data });
  return await saveGHGEnergyConsumptionGridPower(
    data,
    userId as UUID,
    deletedData,
    organizationId as UUID
  );
}
