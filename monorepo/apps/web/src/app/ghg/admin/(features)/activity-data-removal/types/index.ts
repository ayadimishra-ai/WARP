export interface ActivityDataRemovalFilters {
  organizationId: string;
  locationId: string;
  activityId: string;
  month: string;
  year: string;
}

export interface OrganizationOption {
  label: string;
  value: string;
}

export interface LocationOption {
  label: string;
  value: string;
}

export interface ActivityOption {
  label: string;
  value: string;
}

export interface MonthOption {
  label: string;
  value: string;
}

export interface YearOption {
  label: string;
  value: string;
}

export interface ActivityDataRecord {
  id: string;
  organizationName: string;
  locationName: string;
  month: string;
  year: string;
  status: string;
  createdDate: string;
}

export interface ActivityDataSection {
  id: string;
  title: string;
  data: any[];
  isVisible: boolean;
}

export interface SectionedActivityData {
  activityCode: string;
  sections: ActivityDataSection[];
}
