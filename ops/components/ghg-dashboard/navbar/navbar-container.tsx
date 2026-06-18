import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useDashboardStore } from "~/app/[organizationId]/embed/v1/[accessToken]/data-import/store/dashboard.store";
import { useGetKpiDataLazyQuery } from "~/graphql/queries/get-kpi-data.generated";
import { useUserSession } from "~/hooks/use-user-session";
import { getMonthNumberAndIndex } from "~/utils/date.util";
import { GetKPIDataType } from "../common/types";
const NavbarFilters = dynamic(
  () => import("~/components/ghg-dashboard/common/NavbarFilters"),
  {
    ssr: false,
  }
);

const NavbarContainer = () => {
  const session: any = useUserSession();
  const fetchKPIData = useGetKpiDataLazyQuery()[0];
  const {
    init,
    current,
    refreshDBData,
    setBaseLineGlobalFilter,
    setOrganizationData,
  } = useDashboardStore((store) => ({
    init: store.init,
    current: store.current,
    refreshDBData: store.refreshDBData,
    setBaseLineGlobalFilter: store.setBaseLineGlobalFilter,
    setOrganizationData: store.organizationData,
  }));
  // This useEffect is only used for Base Line Year and Month
  // This will store base line year and month to store
  useEffect(() => {
    const { Baselineyear: baseLineYear = 2021, FinancialYearMonth = "april" } =
      setOrganizationData.length > 0 ? setOrganizationData[0] : {};
    const {
      baseLineKPIData,
      baseLineCurrentYearKPIMainData,
      currentYear,
      organizationLevelKPIData,
      previousYear,
      previousYearOrganizationLevelKPIMain,
      organisationLevelKPIEmissionByProducts,
      previousYearorganisationLevelKPIEmissionByProducts,
      baselineLocationKPIMainData,
    } = current || {};

    if (baseLineYear && FinancialYearMonth) {
      const baseLineMonth =
        getMonthNumberAndIndex(FinancialYearMonth).monthNumber;
      init(
        currentYear,
        previousYear,
        baseLineYear || 2021,
        baseLineMonth || 4,
        baseLineKPIData,
        baseLineCurrentYearKPIMainData,
        organizationLevelKPIData,
        previousYearOrganizationLevelKPIMain,
        organisationLevelKPIEmissionByProducts,
        previousYearorganisationLevelKPIEmissionByProducts,
        baselineLocationKPIMainData
      );
      setBaseLineGlobalFilter(baseLineYear, baseLineMonth);
    }
  }, [setOrganizationData, current, init, setBaseLineGlobalFilter]);

  // This is kpi data, set to store
  useEffect(() => {
    const getAllKPIData = async () => {
      if (!!session?.organizationId) {
        const variables = {
          organization_id: session?.organizationId,
        };

        await fetchKPIData({
          variables,
        }).then((response: any) => {
          const { data } = (response as GetKPIDataType) || {};

          const {
            kpiMain = [],
            kpiEmissionByPowerConsumption = [],
            kpiEmissionByFuelConsumption = [],
            kpiEmissionByTransportation = [],
            kpiEmissionByMaterialConsumption = [],
            kpiEmissionByWasteGeneration = [],
            kpiEmissionByMaterialConsumptionSuppliers = [],
            kpiEmissionByPowerConsumptionVendors = [],
            kpiEmissionByProducts = [],
            productionDetail = [],
          } = data || {};

          refreshDBData({
            kpiMain,
            kpiEmissionByPowerConsumption,
            kpiEmissionByFuelConsumption,
            kpiEmissionByTransportation,
            kpiEmissionByMaterialConsumption,
            kpiEmissionByWasteGeneration,
            kpiEmissionByMaterialConsumptionSuppliers,
            kpiEmissionByPowerConsumptionVendors,
            kpiEmissionByProducts,
            productionDetail,
          });
        });
      }
    };

    getAllKPIData();
  }, [setOrganizationData, fetchKPIData, refreshDBData]);

  return <NavbarFilters />;
};

export default NavbarContainer;
