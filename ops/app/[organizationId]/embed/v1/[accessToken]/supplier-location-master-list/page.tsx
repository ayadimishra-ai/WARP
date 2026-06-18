"use client";

import { Box } from "@mantine/core";
import SupplierLocationMasterListingTable from "~/components/supplier-location-master/supplierLocationMasterListingTable";

const SupplierLocationMasterListPage = () => {
  return (
    <Box px={30} py={0}>
      <SupplierLocationMasterListingTable />
    </Box>
  );
};

export default SupplierLocationMasterListPage;
