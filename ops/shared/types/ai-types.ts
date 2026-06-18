import { AiFileData } from "~/graphql/shared/types";
import { AIFileUploadStatus } from "~/shared/constants/ai-constant";
export interface MeterDetail {
  id?: string;
  Location: string;
  LocationId?: string;
  MeterNumber: string;
  UnitsConsumed: number;
  manual?: boolean;
}
export interface ExtractedValues {
  InvoiceNumber: string | null;
  PresentReadingDate: string | null;
  PreviousReadingDate: string | null;
  MeterDetails: MeterDetail[];
}

export interface EditedValues {
  InvoiceNumber?: string | null;
  PresentReadingDate?: string | null;
  PreviousReadingDate?: string | null;
  MeterDetails?: Partial<MeterDetail>[];
}

export interface DataPoint {
  id: string;
  parameter: string;
  extractedValue: string | number | Date | null;
  editedValue: string | number | Date | null;
  isHeader?: boolean;
  meterIndex?: number;
  isNew?: boolean;
  meterDataId?: string;
}

export interface AIFileDataRecord {
  id: string;
  file_id: string;
  extracted_values: ExtractedValues;
  edited_values: EditedValues | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
  created_by: string;
  MeterData?: any[];
  status: keyof typeof AIFileUploadStatus;
  fileUploadId: string;
  file_name: string;
  file_url: string;
}
export interface AIFileUpload {
  id: string;
  activity_code: string;
  file_name: string;
  created_at: string;
  status: string;
  file_url: string;
  errors?: string;
  updated_by?: string;
  verified_at?: string | null;
  verified_by?: string | null;
  location_covered?: string;
  AIFileData?: AiFileData[];
  organization_address_id?: string;
}
export interface TCustomFilter {
  id: string;
  value: string;
}
export interface SectionFilter {
  activity: string;
  activityHeader: string;
  count: number;
}

export interface AllMeterDetails {
  MeterDetails: Record<string, any>[];
  InvoiceNumber: string;
  PresentReadingDate: string;
  PreviousReadingDate: string;
}
