"use client";
import { Box, Button, Table, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import useGetContentHeight from "~/hooks/get-content-height";
import { LocationDetails } from "~/shared/constants/supplier-flow.constant";
import Spinner from "~/shared/UI/spinner/spinner";
import { getBuyerShareData } from "./buyerShareDetails-server-action";

type buyerAllocationType = {
  name: string;
  allocation_percentage: number;
  status: string;
};
const BuyerShareDetails = () => {
  const [buyerAllocationData, setBuyerAllocationData] = useState<
    buyerAllocationType[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const elementRef = useGetContentHeight((height: number) => {
    window.parent.postMessage({ contentHeight: height }, "*");
  }, 314);

  const fetchData = async () => {
    try {
      const item = localStorage.getItem("buyer-share-params") as string | null;
      const params = item ? JSON.parse(item) : null;
      if (params) {
        const { month, year, orgnization_address, organizationId } = params;
        const addressDetail: LocationDetails[] = [
          {
            month: month,
            organizationaddress: orgnization_address,
            OrganizationId: organizationId,
            year: year,
          },
        ];
        const data: any = await getBuyerShareData(addressDetail);
        setBuyerAllocationData(data);
        setIsLoading(false);
      }
    } catch (err) {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
    return () => {
      localStorage.removeItem("buyer-share-params");
    };
  }, []);
  return (
    <Box ref={elementRef}>
      <Text c="#1A1A1A" fz="12px" lh="18px" mb="xs" mt="sm">
        Add monthly share of emission for the pending buyers below.
      </Text>
      <Box className="themeBuyersTable" px="2px">
        {isLoading ? (
          <Spinner />
        ) : (
          <Table withRowBorders={false}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>SN</Table.Th>
                <Table.Th>Buyer Name</Table.Th>
                <Table.Th>% Allocation</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {buyerAllocationData.length > 0 ? (
                buyerAllocationData.map((item, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>{index + 1}</Table.Td>
                    <Table.Td>{item?.name}</Table.Td>
                    <Table.Td>
                      {item?.status != "pending" ? (
                        <Text fz={12} c="#000000">
                          {item?.allocation_percentage?.toFixed(1)}
                        </Text>
                      ) : (
                        <Button
                          size="20px"
                          color="#FF9907"
                          radius="xl"
                          styles={{
                            root: {
                              color: "#000000",
                              pointerEvents: "none",
                              fontSize: "10px",
                              lineHeight: "13.62px",
                              fontWeight: "400",
                              padding: "0 10px",
                              height: "20px",
                            },
                          }}
                        >
                          Pending
                        </Button>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={3} style={{ textAlign: "center" }}>
                    <Text
                      opacity={0.5}
                      fz={14}
                      styles={{
                        root: {
                          textShadow: "black 0px 0px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                        },
                      }}
                    >
                      No data available
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        )}
      </Box>
    </Box>
  );
};

export default BuyerShareDetails;
