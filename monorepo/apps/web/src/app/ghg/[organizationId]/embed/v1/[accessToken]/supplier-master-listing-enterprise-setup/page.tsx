"use client";

import { Stack } from "@mantine/core";
import SupplierMasterTableEnterpriseSetup from "@/modules/ghg/components/common-table/SupplierMasterTableEnterpriseSetup";

const SupplierMasterListingEnterpriseSetupPage = () => {
  return (
    <Stack px={30} py={0}>
      <div>
        <SupplierMasterTableEnterpriseSetup />
      </div>
    </Stack>
  );
};

export default SupplierMasterListingEnterpriseSetupPage;
