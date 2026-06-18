import {
  RequestValidationType,
  requestSheetNameValidationSchema,
  requestValidationSchema,
} from "@/modules/ghg/lib/validation-schemas/excel-data-import-api.schema";
import {
  ActivityExcelSheetNames,
  ActivityType,
} from "../constants/activity.constant";

export const parseInputData = (data: RequestValidationType) => {
  return requestValidationSchema.parse(data);
};

export const sheetNameValidation = (activity: ActivityType) => {
  const validSheetNames = ActivityExcelSheetNames[activity];

  const record = requestSheetNameValidationSchema.parse(validSheetNames);

  return record;
};
