"use client";

import { Box } from "@mantine/core";
import SupplierMaterialMappingTable from "~/components/supplier-material-mapping/supplierMaterialMappingTable";

const SupplierMaterialMappingPage = () => {
  return (
    <Box px={30} py={0}>
      <SupplierMaterialMappingTable />
    </Box>
  );
};

export default SupplierMaterialMappingPage;
