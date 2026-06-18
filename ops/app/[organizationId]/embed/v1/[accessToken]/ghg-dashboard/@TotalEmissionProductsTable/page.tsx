"use client";
import { Box } from "@mantine/core";
import dynamic from "next/dynamic";

const TotalEmissionProductsTable = dynamic(
  () =>
    import(
      "~/components/ghg-dashboard/emission-contributors/TotalEmissionByProductsTable"
    ),
  {
    ssr: false,
  }
);
const EmissionContributionByProductsTable = () => {
  return (
    <Box>
      <TotalEmissionProductsTable />
    </Box>
  );
};
export default EmissionContributionByProductsTable;
