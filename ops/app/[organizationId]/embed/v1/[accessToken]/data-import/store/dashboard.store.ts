import { WritableDraft } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  DashboardActionsType,
  DashboardDescription,
  DashboardType,
} from "./types";

export const useDashboardStore = create(
  immer<DashboardType & DashboardActionsType>((set, get) => ({
    current: {
      currentYear: null,
      previousYear: null,
      baseLineYear: 2021,
      baseLineMonth: 4,
      baseLineKPIData: null,
      baseLineCurrentYearKPIMainData: null,
      organizationLevelKPIData: null,
      previousYearOrganizationLevelKPIMain: null,
      organisationLevelKPIEmissionByProducts: null,
      previousYearorganisationLevelKPIEmissionByProducts: null,
      baselineLocationKPIMainData: null,
    },
    globalFilters: {
      selectedDuration: "baseline",
      selectedLocations: null,
      selectedRegions: null,
      baseLineYear: 2021,
      baseLineMonth: 4,
    },
    dbData: {
      kpiMain: [],
      kpiEmissionByFuelConsumption: [],
      kpiEmissionByMaterialConsumption: [],
      kpiEmissionByPowerConsumption: [],
      kpiEmissionByTransportation: [],
      kpiEmissionByWasteGeneration: [],
      kpiEmissionByMaterialConsumptionSuppliers: [],
      kpiEmissionByPowerConsumptionVendors: [],
      kpiEmissionByProducts: [],
      productionDetail: [],
    },
    dashboardDescription: {
      kpiDescription: null,
    },
    regionData: {
      regions: [],
    },
    locationData: {
      locations: [],
    },
    organizationData: [],
    init: (
      currentYear,
      previousYear,
      baseLineYear,
      baseLineMonth,
      baseLineKPIData,
      baseLineCurrentYearKPIMainData,
      organizationLevelKPIData,
      previousYearOrganizationLevelKPIMain,
      organisationLevelKPIEmissionByProducts,
      previousYearorganisationLevelKPIEmissionByProducts,
      baselineLocationKPIMainData
    ) => {
      set((store) => {
        store.current.currentYear = currentYear;
        store.current.previousYear = previousYear;
        store.current.baseLineYear = baseLineYear;
        store.current.baseLineMonth = baseLineMonth;
        store.current.baseLineKPIData = baseLineKPIData;
        store.current.baseLineCurrentYearKPIMainData =
          baseLineCurrentYearKPIMainData;
        store.current.organizationLevelKPIData = organizationLevelKPIData;
        store.current.previousYearOrganizationLevelKPIMain =
          previousYearOrganizationLevelKPIMain;
        store.current.organisationLevelKPIEmissionByProducts =
          organisationLevelKPIEmissionByProducts;
        store.current.previousYearorganisationLevelKPIEmissionByProducts =
          previousYearorganisationLevelKPIEmissionByProducts;
        store.current.baselineLocationKPIMainData = baselineLocationKPIMainData;
      });
    },
    changeDashboardHandler(
      currentYear,
      previousYear,
      baseLineYear,
      baseLineMonth,
      baseLineKPIData,
      baseLineCurrentYearKPIMainData,
      organizationLevelKPIData,
      previousYearOrganizationLevelKPIMain,
      organisationLevelKPIEmissionByProducts,
      previousYearorganisationLevelKPIEmissionByProducts,
      baselineLocationKPIMainData
    ) {
      set((store) => {
        store.current.currentYear = currentYear;
        store.current.previousYear = previousYear;
        store.current.baseLineYear = baseLineYear;
        store.current.baseLineMonth = baseLineMonth;
        store.current.baseLineKPIData = baseLineKPIData;
        store.current.baseLineCurrentYearKPIMainData =
          baseLineCurrentYearKPIMainData;
        store.current.organizationLevelKPIData = organizationLevelKPIData;
        store.current.previousYearOrganizationLevelKPIMain =
          previousYearOrganizationLevelKPIMain;
        store.current.organisationLevelKPIEmissionByProducts =
          organisationLevelKPIEmissionByProducts;
        store.current.previousYearorganisationLevelKPIEmissionByProducts =
          previousYearorganisationLevelKPIEmissionByProducts;
        store.current.baselineLocationKPIMainData = baselineLocationKPIMainData;
      });
    },
    setDurationGlobalFilter: (selectedDuration: string | null) => {
      set((store) => {
        store.globalFilters.selectedDuration = selectedDuration;
      });
    },
    setLocationsGlobalFilter: (selectedLocations: string[] | null) => {
      set((store) => {
        store.globalFilters.selectedLocations = selectedLocations;
      });
    },
    setRegionsGlobalFilter: (selectedRegions: string[] | null) => {
      set((store) => {
        store.globalFilters.selectedRegions = selectedRegions;
      });
    },
    setDashboardDescription: (
      dashboardDescription: WritableDraft<DashboardDescription>
    ) => {
      set((store) => {
        store.dashboardDescription = dashboardDescription;
      });
    },
    setBaseLineGlobalFilter: (baseLineYear: number, baseLineMonth: number) => {
      set((store) => {
        store.globalFilters.baseLineYear = baseLineYear;
        store.globalFilters.baseLineMonth = baseLineMonth;
      });
    },
    refreshDBData: (dataData: any | null) => {
      set((store) => {
        store.dbData = dataData;
      });
    },
    setRegionData: (regionData: any | null) => {
      set((store) => {
        store.regionData.regions = regionData;
      });
    },
    setLocationData: (locationData: any | null) => {
      set((store) => {
        store.locationData.locations = locationData;
      });
    },
    setOrganizationData: (OrganizationData: any | null) => {
      set((store) => {
        store.organizationData = OrganizationData;
      });
    },
  }))
);
