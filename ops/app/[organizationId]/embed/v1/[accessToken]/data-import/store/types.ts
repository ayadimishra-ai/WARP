import { WritableDraft } from "immer";
import { KPIDataType } from "~/components/ghg-dashboard/common/types";

type CurrentDashboardType = {
  currentYear: object | null;
  previousYear: object | null;
  baseLineYear: number | 0;
  baseLineMonth: number | 0;
  baseLineKPIData: object[] | null;
  baseLineCurrentYearKPIMainData: object[] | null;
  organizationLevelKPIData: object[] | null;
  previousYearOrganizationLevelKPIMain: object[] | null;
  previousYearorganisationLevelKPIEmissionByProducts: object[] | null;
  organisationLevelKPIEmissionByProducts: object[] | null;
  baselineLocationKPIMainData: object[] | null;
};

export type DashboardType = {
  current: CurrentDashboardType;
  globalFilters: {
    selectedDuration: string | null;
    selectedLocations: string[] | null;
    selectedRegions: string[] | null;
    baseLineYear: number;
    baseLineMonth: number;
  };
  dashboardDescription: DashboardDescription;
  dbData: KPIDataType | null;
  regionData: any | null;
  locationData: any | null;
  organizationData: any | null;
};
export type DashboardActionsType = {
  init: (
    currentYear: object | null,
    previousYear: object | null,
    baseLineYear: number | 0,
    baseLineMonth: number | 0,
    baseLineKPIData: object[] | null,
    baseLineCurrentYearKPIMainData: object[] | null,
    organizationLevelKPIData: object[] | null,
    previousYearOrganizationLevelKPIMain: object[] | null,
    previousYearorganisationLevelKPIEmissionByProducts: object[] | null,
    organisationLevelKPIEmissionByProducts: object[] | null,
    baselineLocationKPIMainData: object[] | null
  ) => void;
  changeDashboardHandler: (
    currentYear: object | null,
    previousYear: object | null,
    baseLineYear: number | 0,
    baseLineMonth: number | 0,
    baseLineKPIData: object[] | null,
    baseLineCurrentYearKPIMainData: object[] | null,
    organizationLevelKPIData: object[] | null,
    previousYearOrganizationLevelKPIMain: object[] | null,
    previousYearorganisationLevelKPIEmissionByProducts: object[] | null,
    organisationLevelKPIEmissionByProducts: object[] | null,
    baselineLocationKPIMainData: object[] | null
  ) => void;
  setDashboardDescription: (
    dashboardDescription: WritableDraft<DashboardDescription>
  ) => void;
  setDurationGlobalFilter: (selectedDuration: string | null) => void;
  setRegionsGlobalFilter: (selectedRegions: string[] | null) => void;
  setLocationsGlobalFilter: (selectedLocations: string[] | null) => void;
  setBaseLineGlobalFilter: (
    baseLineYear: number,
    baseLineMonth: number
  ) => void;
  refreshDBData: (dataData: any | null) => void;
  setRegionData: (regionData: any | null) => void;
  setLocationData: (locationData: any | null) => void;
  setOrganizationData: (OrganizationData: any[] | null) => void;
};

export interface DashboardDescription {
  kpiDescription: KpiDescription | null;
}

export interface KpiDescription {
  baseline_emission_summary: BaselineEmissionSummary[];
  organization_level_snapshot: OrganizationLevelSnapshot[];
  my_view_snapshot: MyViewSnapshot[];
  emission_by_scope: EmissionByScopeType[];
  emission_snapshot: EmissionSnapshot[];
  emission_contributors: EmissionContributor[];
  emission_intensity_insights: EmissionIntensityInsight[];
  emission_by_critical_factors: EmissionByCriticalFactor[];
}

export interface BaselineEmissionSummary {
  info: string;
  category: string;
  description: string;
}

export interface OrganizationLevelSnapshot {
  info: string;
  category: string;
  description: string;
}

export interface MyViewSnapshot {
  info: string;
  category: string;
  description: string;
}

export interface EmissionByScopeType {
  info: string;
  category: string;
  description: string;
}

export interface EmissionSnapshot {
  info: string;
  category: string;
  description: string;
}

export interface EmissionContributor {
  info: string;
  category: string;
  description: string;
}

export interface EmissionIntensityInsight {
  info: string;
  category: string;
  description: string;
}

export interface EmissionByCriticalFactor {
  info: string;
  category: string;
  description: string;
}

export interface CurrentPreviousYearMonthVariablesType {
  currentYearFrom: number;
  currentMonthFrom: number;
  currentYearTo: number;
  currentMonthTo: number;
  previousYearFrom: number;
  previousMonthFrom: number;
  previousYearTo: number;
  previousMonthTo: number;
}
