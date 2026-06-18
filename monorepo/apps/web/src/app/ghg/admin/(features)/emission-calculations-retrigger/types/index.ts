export interface EmissionCalculationsRetriggerFilters {
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
