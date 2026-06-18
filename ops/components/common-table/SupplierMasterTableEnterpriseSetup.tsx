"use client";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import {
  faSearch,
  faSort,
  faSortDown,
  faSortUp,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  Menu,
  Popover,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconChevronDown, IconInfoCircle } from "@tabler/icons-react";
import {
  type MRT_ColumnDef,
  type MRT_Icons,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "mantine-react-table";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiClientWithAuth } from "~/lib/fetcher";
import {
  addEditLocation,
  addEditSupplierMaster,
  bulkUploadSupplierMaster,
  postParentMessage,
} from "~/shared/services/platform-window-message-service";
import Spinner from "~/shared/UI/spinner/spinner";
import EditIcon from "../icons/EditIcon";
import AddSupplierPage from "../supplier-listing-add-supplier-enterprise-setup/addSupplierPage";
import CommonTable from "./commonTable";
import classes from "./CSS.module.css";

config.autoAddCss = false;

const getStatusColor = (status: string) => {
  switch (status) {
    case "Invited":
      return "#98BBFF";
    case "Not Invited":
      return "#D0ADFF";
    case "Onboarded":
      return "#7FE5FF";
    default:
      return "gray";
  }
};

type SupplierMaster = {
  id: string;
  code: string;
  category: string;
  country: string;
  name: string;
  supplier_admin_name?: string;
  supplier_admin_email_id?: string;
  supplier_email?: string;
  supplier_full_address: string;
  supplier_gst_or_license_number: string;
  buyer_features: string;
  onboarding_date: string;
  supplier_status: string;
};

const faIcons: Partial<MRT_Icons> = {
  IconArrowsSort: (props: any) => <FontAwesomeIcon icon={faSort} {...props} />,
  IconSortAscending: (props: any) => (
    <FontAwesomeIcon icon={faSortUp} {...props} />
  ),
  IconSortDescending: (props: any) => (
    <FontAwesomeIcon icon={faSortDown} {...props} />
  ),
};

const useSupplierColumns = (): MRT_ColumnDef<SupplierMaster>[] => {
  return useMemo(() => {
    return [
      {
        accessorKey: "code",
        header: "Supplier Code",
        size: 100,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return value && String(value).trim() !== "" ? String(value) : "-";
        },
      },
      {
        accessorKey: "name",
        header: "Supplier Name",
        size: 150,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return value && String(value).trim() !== "" ? String(value) : "-";
        },
      },
      {
        accessorKey: "category",
        header: "Supplier Category",
        size: 150,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return value && String(value).trim() !== "" ? String(value) : "-";
        },
      },
      {
        accessorKey: "supplier_admin_name",
        header: "SPOC Name",
        size: 100,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return value && String(value).trim() !== "" ? String(value) : "-";
        },
      },
      {
        accessorKey: "supplier_admin_email_id",
        header: "SPOC Email",
        size: 100,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return value && String(value).trim() !== "" ? String(value) : "-";
        },
      },
      // {
      //   accessorKey: "supplier_full_address",
      //   header: "Supplier Full Address",
      //   Cell: ({ cell }) => {
      //     const value = cell.getValue();
      //     return value && String(value).trim() !== "" ? String(value) : "-";
      //   },
      // },
      {
        accessorKey: "supplier_gst_or_license_number",
        header: "PAN/License No",
        size: 80,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return value && String(value).trim() !== "" ? String(value) : "-";
        },
      },
      // {
      //   accessorKey: "buyer_features",
      //   header: "Data Required For",
      //   size: 150,
      //   Cell: ({ cell }) => {
      //     const value = cell.getValue();
      //     return value && String(value).trim() !== "" ? String(value) : "-";
      //   },
      // },
      // {
      //   accessorKey: "onboarding_date",
      //   header: "Onboarding Date",
      //   size: 120,
      //   Cell: ({ cell }) => {
      //     const value = cell.getValue();
      //     if (!value || String(value).trim() === "") return "-";

      //     const addressText = String(value);
      //     return (
      //       <Tooltip
      //         label={addressText}
      //         position="top"
      //         withArrow
      //         arrowPosition="side"
      //         multiline
      //         w={200}
      //         styles={{
      //           tooltip: {
      //             backgroundColor: "#003B52",
      //             color: "#fff",
      //             fontSize: "12px",
      //             padding: "8px 12px",
      //             wordWrap: "break-word",
      //           },
      //         }}
      //       >
      //         <div
      //           style={{
      //             overflow: "hidden",
      //             textOverflow: "ellipsis",
      //             whiteSpace: "nowrap",
      //             cursor: "context-menu",
      //             maxWidth: "200px",
      //           }}
      //         >
      //           {addressText}
      //         </div>
      //       </Tooltip>
      //     );
      //   },
      // },
      // {
      //   accessorKey: "supplier_status",
      //   header: "Onboarding Status",
      //   size: 120,
      //   Cell: ({ cell }) => {
      //     const value = cell.getValue();
      //     if (!value || String(value).trim() === "") return "-";

      //     const addressText = String(value);
      //     return (
      //       <Tooltip
      //         label={addressText}
      //         position="top"
      //         withArrow
      //         multiline
      //         w={200}
      //         styles={{
      //           tooltip: {
      //             backgroundColor: "#003B52",
      //             color: "#fff",
      //             fontSize: "12px",
      //             padding: "8px 12px",
      //             wordWrap: "break-word",
      //           },
      //         }}
      //       >
      //         <div
      //           style={{
      //             overflow: "hidden",
      //             textOverflow: "ellipsis",
      //             whiteSpace: "nowrap",
      //             cursor: "context-menu",
      //             width: "max-content",
      //             color: "#444444",
      //           }}
      //         >
      //           <Badge
      //             color={getStatusColor(addressText)}
      //             radius="xl"
      //             styles={{
      //               root: {
      //                 color: "#444444",
      //                 textTransform: "none",
      //                 fontWeight: 100,
      //                 padding: "0px 14px",
      //                 height: "22px",
      //               },
      //             }}
      //           >
      //             {addressText}
      //           </Badge>
      //         </div>
      //       </Tooltip>
      //     );
      //   },
      // },
    ];
  }, []);
};

const SupplierMasterTableEnterpriseSetup = () => {
  const params = useParams();
  const [data, setData] = useState<SupplierMaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const isInitialLoad = useRef(true);

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  const columns = useSupplierColumns();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return;
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, [debouncedSearchTerm, searchTerm]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, [sorting]);

  useEffect(() => {
    isInitialLoad.current = true;
  }, [params?.accessToken, params?.organizationId]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        if (isInitialLoad.current) {
          setLoading(true);
          isInitialLoad.current = false;
        } else {
          setIsRefetching(true);
        }

        const queryParams = new URLSearchParams({
          pageIndex: pagination.pageIndex.toString(),
          pageSize: pagination.pageSize.toString(),
        });

        if (debouncedSearchTerm.trim()) {
          queryParams.append("search", debouncedSearchTerm.trim());
        }

        if (sorting.length > 0) {
          queryParams.append("sortBy", sorting[0].id);
          queryParams.append("sortOrder", sorting[0].desc ? "desc" : "asc");
        }
        const res = await apiClientWithAuth.get(
          `/api/v1/master-data/org-supplier-master-enterprise-setup/listing?${queryParams.toString()}`
        );
        const supplierListData = res?.data?.data?.supplierList;
        const apiData = supplierListData?.suppliers || supplierListData || [];
        const apiTotalCount =
          res?.data?.data?.pagination?.totalCount ||
          supplierListData?.totalCount ||
          0;

        const mappedData: SupplierMaster[] = apiData.map((item: any) => ({
          id: item.id,
          code: item.code || item.supplier_code || "",
          name: item.name || item.supplier_name || "",
          supplier_admin_name: item.supplier_admin_name || "",
          supplier_admin_email_id: item.supplier_admin_email_id || "",
          supplier_email: item.supplier_admin_email_id || "",
          supplier_full_address: item.supplier_full_address,
          supplier_gst_or_license_number: item.supplier_gst_or_license_number,
          category: item.category,
          country: item.country,
          buyer_features: item.buyer_features ? item.buyer_features : "-",
          onboarding_date: item.onboarding_date
            ? new Date(item.onboarding_date.split("T")[0]).toLocaleDateString(
                "en-GB",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )
            : "-",
          supplier_status: item.supplier_status,
        }));

        setData(mappedData);
        setTotalCount(apiTotalCount);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        setData([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
        setIsRefetching(false);
      }
    };

    fetchSuppliers();
  }, [
    params?.accessToken,
    params?.organizationId,
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearchTerm,
    sorting,
  ]);

  const handleDownloadTemplate = async () => {
    try {
      const res = await apiClientWithAuth.get(
        "/api/v1/master-data/activity/supplier-master/download-template"
      );
      const url = res?.data?.response?.url;
      const fileName = `Supplier Master.xlsx`;
      if (url) {
        // Fetch the file as a blob and trigger download with custom filename
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error downloading template:", error);
      return;
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.currentTarget.value);
  };

  const hasNoFiltersApplied =
    pagination?.pageIndex === 0 &&
    debouncedSearchTerm?.trim() === "" &&
    sorting?.length === 0;

  const tableConfig = useMemo(
    () => ({
      enableColumnFilters: false,
      enableGlobalFilter: false,
      enableGlobalFilterModes: false,
      enableDensityToggle: false,
      enableColumnActions: false,
      enableFullScreenToggle: false,
      enableHiding: false,
      enableTopToolbar: true,
      enableBottomToolbar: true,
      globalFilterFn: "fuzzy",
      renderTopToolbarCustomActions: () => (
        <Group
          justify="space-between"
          style={{ width: "100%" }}
          pt={0}
          pb={18}
          gap={24}
          mt={0}
        >
          <Flex>
            <Link
              href="#"
              style={{
                fontWeight: 600,
                color: "#FFA93C",
                margin: "10px 10px 10px 0",
                textDecoration: "none",
                fontSize: "14px",
                lineHeight: "24px",
              }}
            >
              All({totalCount})
            </Link>
          </Flex>
          <Flex gap={10} align="center">
            <TextInput
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              leftSection={
                <FontAwesomeIcon
                  icon={faSearch}
                  style={{ fontSize: 14, color: "#666" }}
                />
              }
              rightSection={
                searchTerm && (
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={() => setSearchTerm("")}
                    style={{
                      cursor: "pointer",
                      color: "rgb(102, 102, 102) !important",
                      fontWeight: "bold !important",
                      fontSize: "12px !important",
                    }}
                  >
                    ✕
                  </ActionIcon>
                )
              }
              style={{ width: 300 }}
              styles={{
                input: {
                  borderRadius: 20,
                  border: "1px solid #F1F3F6",
                  paddingLeft: 40,
                  backgroundColor: "#F1F3F6",
                },
              }}
            />
            <Menu
              // position="bottom-end"
              offset={5}
              width={200}
              shadow="md"
              withArrow
              arrowPosition="center"
            >
              {/* <ExportSupplierMaster /> */}
              <Menu.Target>
                <Button
                  variant="unstyled"
                  color="#005C81"
                  fw={600}
                  fz={12}
                  h={36}
                  px={20}
                  radius="xl"
                  rightSection={<IconChevronDown size={14} />}
                  className="noAnimationButton filledGradientButton"
                  onClick={() => {
                    postParentMessage(addEditLocation(true, ""));
                  }}
                >
                  ADD DATA
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  // style={{ fontSize: "12px", color: "#666666" }}
                  onClick={() => {
                    postParentMessage(bulkUploadSupplierMaster());
                  }}
                >
                  Bulk Upload Data
                </Menu.Item>
                <Menu.Item
                  // style={{ fontSize: "12px", color: "#666666" }}
                  onClick={() => {
                    handleDownloadTemplate();
                  }}
                >
                  Download Template
                </Menu.Item>
                {/* <Menu.Item
                  style={{ fontSize: "12px", color: "#666666" }}
                  onClick={() => {
                    postParentMessage(addEditSupplierMaster(true, ""));
                  }}
                >
                  Add New Supplier
                </Menu.Item>*/}
              </Menu.Dropdown>
            </Menu>
          </Flex>
        </Group>
      ),
      mantinePaperProps: {
        className: classes.LocationListingStyle,
      },
      icons: faIcons,
      enableRowNumbers: true,
      rowNumberMode: "original",
      enablePagination: true,
      displayColumnDefOptions: {
        // "mrt-row-actions": { size: 50, Header: "Action" },
        "mrt-row-select": { size: 20, Header: "" },
        "mrt-row-numbers": {
          size: 15,
          Header: "SN",
          mantineTableHeadCellProps: {
            style: {
              paddingTop: 14,
              fontSize: 12,
            },
          },
        },
      },
      enableRowActions: false,
      positionActionsColumn: "last",
      paginationDisplayMode: "pages",
      manualPagination: true,
      manualSorting: true,
      manualFiltering: false,
      rowCount: totalCount,
      onPaginationChange: setPagination,
      onSortingChange: setSorting,
      state: {
        pagination,
        sorting,
        isLoading: loading,
        showProgressBars: isRefetching,
      },
      mantineProgressProps: ({ isTopToolbar }: any) => ({
        color: "#72D0C6",
        style: { display: isTopToolbar ? "block" : "none" },
        value: 100,
      }),
      renderRowActions: ({ row }: any) => (
        <Flex gap={10} align="center">
          <ActionIcon
            onClick={() => {
              postParentMessage(addEditSupplierMaster(true, ""));
            }}
            disabled={
              row?.original?.supplier_status?.toLowerCase() === "onboarded"
            }
          >
            <EditIcon size={26} />
          </ActionIcon>
          <Popover width={235} position="bottom-end" shadow="md">
            <Popover.Target>
              <ActionIcon variant="subtle" size="sm">
                <IconInfoCircle size={30} color="#003B52" />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack gap="sm" p="xs">
                <Box>
                  <Text size="xs" c="#666666" fw={400} mb={2}>
                    Country
                  </Text>
                  <Text color="#444444" size="sm" fw={400}>
                    {row?.original?.country || "-"}
                  </Text>
                </Box>

                <Box>
                  <Text size="xs" c="#666666" fw={400} mb={2}>
                    Supplier Category
                  </Text>
                  <Text color="#444444" size="sm" fw={400}>
                    {row?.original?.category || "-"}
                  </Text>
                </Box>

                <Box mt={11}>
                  <Text size="xs" c="#666666" fw={400} mb={2}>
                    SPOC Name
                  </Text>
                  <Text color="#444444" size="sm" fw={400}>
                    {row?.original?.supplier_admin_name || "-"}
                  </Text>
                </Box>

                <Box mt={11}>
                  <Text size="xs" c="#666666" fw={400} mb={2}>
                    SPOC Email
                  </Text>
                  <Text color="#444444" size="sm" fw={400}>
                    {row?.original?.supplier_admin_email_id || "-"}
                  </Text>
                </Box>
              </Stack>
            </Popover.Dropdown>
          </Popover>
        </Flex>
      ),
    }),
    [
      handleSearchChange,
      loading,
      isRefetching,
      pagination,
      searchTerm,
      sorting,
      totalCount,
    ]
  );

  if (!loading && !isRefetching && data.length === 0 && hasNoFiltersApplied) {
    return <AddSupplierPage />;
  }

  if (loading && data.length === 0) {
    return <Spinner />;
  }

  return (
    <>
      <h2
        style={{
          marginBottom: "0px",
          color: "#444444",
          marginTop: "27px",
          fontSize: "22px",
          fontWeight: "400",
        }}
      >
        List of Suppliers
      </h2>

      <CommonTable data={data} columns={columns} tableConfig={tableConfig} />
    </>
  );
};

export default SupplierMasterTableEnterpriseSetup;
