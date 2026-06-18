export interface AiFileRemovalFilters {
  organizationId: string;
}

export interface OrganizationOption {
  label: string;
  value: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  organization_id: string;
  role: string;
}

export interface AiFileUpload {
  id: string;
  file_name: string | null;
  file_url: string | null;
  status: string | null;
  AppUser?: {
    name: string;
    email: string;
  } | null;
  AIFileData?: Array<{
    present_reading_date: any;
    previous_reading_date: any;
  }> | null;
}

export interface AIFileData {
  edited_values: any;
  extracted_values: any;
  present_reading_date: any;
  previous_reading_date: any;
}

export interface GHGEnergyGridPower {
  id: string;
  task_request_id: string | null;
  activity_task_request_id: string | null;
  organization_address_id: string | null;
  metadata: any;
}

export interface TaskRequest {
  year: number | null;
  month: number | null;
  organization_address_id: string | null;
  GHGEnergyConsumption_GridPowers: GHGEnergyGridPower[];
}

export interface TaskRequestDetails {
  id: string;
  organization_address_id: string;
  month: string;
  year: number | null;
  status: string | null;
  metadata: any;
  is_deleted: boolean;
  OrganizationAddress?: {
    Address: {
      name: string;
      code: string | null;
      pincode: string;
      type: string;
      ownership_type: string;
      Country: {
        region_code: string | null;
      };
    };
  };
}

export interface AIFileUploadDetails {
  is_deleted: boolean;
  status: string | null;
  AIFileData: AIFileData[];
}

export interface AIFileActivityTaskRequestMapping {
  task_request_id: string | null;
  activity_task_request_id: string | null;
  aifileupload_id: string | null;
  AIFileUpload?: AIFileUploadDetails | null;
  TaskRequest?: TaskRequest | null;
}

export interface AIFileDataRecord {
  id: string;
  file_id: string;
}

export interface MeterData {
  id: string;
  filedata_id: string | null;
  meter_number: string | null;
  organization_address_id: string | null;
  average_units_consumed?: number | null;
}

export interface MeterOrganizationAddressMapping {
  id: string;
  meter_number: string | null;
  organization_address_id: string | null;
  MeterData?: MeterData[];
}

export interface AIFileDataAndMeterMappingsResult {
  aiFileDataRecords: AIFileDataRecord[];
  meterMappings: MeterOrganizationAddressMapping[];
  meterData: MeterData[];
  gridPowerData: GHGEnergyGridPower[];
  taskRequestDetails: TaskRequestDetails[];
  aiFileDataIds: string[];
  taskRequestIds: string[];
  organizationId: string;
}
