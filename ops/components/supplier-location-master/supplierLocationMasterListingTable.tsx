"use client";

import { faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ActionIcon,
  Box,
  Button,
  Flex,
  Group,
  MantineProvider,
  Menu,
  Text,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconChevronDown } from "@tabler/icons-react";
import {
  MantineReactTable,
  MRT_PaginationState,
  MRT_SortingState,
  MRT_TablePagination,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import { useUserSession } from "~/hooks/use-user-session";
import { apiClientWithAuth } from "~/lib/fetcher";
import {
  bulkUploadSupplierLocationMaster,
  postParentMessage,
} from "~/shared/services/platform-window-message-service";
import Spinner from "~/shared/UI/spinner/spinner";
import SupplierLocationMasterEmptyState from "./supplierLocationMasterEmptyState";
import classes from "./supplierLocationMasterListingTable.module.css";

type SupplierLocationMasterRow = {
  id: string;
  code: string | null;
  name: string;
  location: string | null;
  location_code: string | null;
  address: string | null;
  country: string | null;
  pincode: string | null;
  SupplierLocationMappings_aggregate?: {
    aggregate?: { count?: number };
  };
};

const columns: MRT_ColumnDef<SupplierLocationMasterRow>[] = [
  {
    id: "sn",
    header: "SN",
    enableSorting: false,
    enableColumnFilter: false,
    size: 60,
    Cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return pageIndex * pageSize + row.index + 1;
    },
  },
  {
    accessorKey: "code",
    header: "Supplier Code",
    enableColumnFilter: true,
    Cell: ({ cell }) => {
      const value = cell.getValue<string>();
      return value && value.trim() !== "" ? value : "-";
    },
  },
  {
    accessorKey: "name",
    header: "Supplier Name",
    enableColumnFilter: true,
    Cell: ({ cell }) => {
      const value = cell.getValue<string>();
      return value && value.trim() !== "" ? value : "-";
    },
  },
  {
    accessorKey: "location",
    header: "Location Name",
    enableColumnFilter: true,
    Cell: ({ cell }) => {
      const value = cell.getValue<string>();
      return value && value.trim() !== "" ? value : "-";
    },
  },
  {
    accessorKey: "location_code",
    header: "Location Code",
    enableColumnFilter: true,
    Cell: ({ cell }) => {
      const value = cell.getValue<string>();
      return value && value.trim() !== "" ? value : "-";
    },
  },
  {
    accessorKey: "address",
    header: "Location Address",
    enableColumnFilter: true,
    Cell: ({ cell }) => {
      const value = cell.getValue<string>();
      return value && value.trim() !== "" ? value : "-";
    },
  },
  {
    accessorKey: "country",
    header: "Country",
    enableColumnFilter: true,
    Cell: ({ cell }) => {
      const value = cell.getValue<string>();
      return value && value.trim() !== "" ? value : "-";
    },
  },
  {
    accessorKey: "pincode",
    header: "Pin/Zip Code",
    enableColumnFilter: true,
    Cell: ({ cell }) => {
      const value = cell.getValue<string>();
      return value && value.trim() !== "" ? value : "-";
    },
  },
];

const SupplierLocationMasterListingTable: React.FC = () => {
  const session = useUserSession();
  const [data, setData] = useState<SupplierLocationMasterRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [hasEverLoaded, setHasEverLoaded] = useState(false);

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [debounced] = useDebouncedValue(globalFilter, 200);

  const fetchData = useCallback(async () => {
    if (!session?.organizationId) return;

    if (!hasEverLoaded) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }

    try {
      const sortBy = sorting[0]?.id || "";
      const sortOrder = sorting[0]?.desc ? "desc" : "asc";

      const params = new URLSearchParams({
        pageIndex: String(pagination.pageIndex),
        pageSize: String(pagination.pageSize),
        search: debounced || "",
        sortBy,
        sortOrder,
      });

      const response = await apiClientWithAuth.get(
        `/api/v1/master-data/org-supplier-location-master/listing?${params.toString()}`
      );

      if (response?.data?.success) {
        const rows = (response.data.data || []).map((item: any) => ({
          id: item.id,
          code: item.OrgSupplierMaster?.code ?? null,
          name: item.OrgSupplierMaster?.name ?? "",
          location: item.Address?.name ?? null,
          location_code: item.Address?.code ?? null,
          address: item.Address?.full_address ?? null,
          country: item.Address?.Country?.name ?? null,
          pincode: item.Address?.pincode ?? null,
          SupplierLocationMappings_aggregate:
            item.SupplierLocationMappings_aggregate,
        }));
        setData(rows);
        setRowCount(response.data.totalCount || 0);
        setHasEverLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching supplier location master list:", error);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [
    session?.organizationId,
    pagination.pageIndex,
    pagination.pageSize,
    debounced,
    sorting,
    hasEverLoaded,
  ]);

  useEffect(() => {
    if (session?.organizationId) {
      fetchData();
    }
  }, [
    session?.organizationId,
    pagination.pageIndex,
    pagination.pageSize,
    debounced,
    sorting,
  ]);

  // Listen for refresh signal from parent SPA
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log(event);
      if (typeof event.data === "string") {
        try {
          const parsed = JSON.parse(event.data);
          if (
            parsed.type === "refresh-supplier-location-master-listing" ||
            parsed.type === "bulk-page-refresh"
          ) {
            if (parsed.data?.action === "add")
              setPagination({ pageIndex: 0, pageSize: 10 });
            setGlobalFilter("");
            fetchData();
          }
        } catch {
          // legacy plain-string fallback
          if (event.data === "callApi") {
            setPagination({ pageIndex: 0, pageSize: 10 });
            setGlobalFilter("");
            fetchData();
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [fetchData]);

  const handleDownloadTemplate = async () => {
    try {
      const response = await apiClientWithAuth.get(
        "/api/v1/master-data/org-supplier-location-master/template"
      );

      if (response?.data?.success && response?.data?.data?.url) {
        const url = response.data.data.url;

        const urlPath = new URL(url).pathname;
        const filename = urlPath.substring(urlPath.lastIndexOf("/") + 1);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          filename || "SupplierLocationMaster.xlsx"
        );
        link.setAttribute("target", "_blank");
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error("Failed to download template:", error);
    }
  };

  const table = useMantineReactTable({
    columns,
    data,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount,
    paginationDisplayMode: "pages",
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function" ? updater(pagination) : updater;
      setPagination(next);
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: (value: string) => {
      setGlobalFilter(value || "");
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    state: {
      pagination,
      sorting,
      globalFilter,
      isLoading: isRefetching,
    },
    enableRowSelection: false,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableFilters: true,
    enableColumnFilters: true,
    mantinePaperProps: {
      className: classes.SupplierLocationMasterListingStyle,
    },
    // Custom top toolbar
    renderTopToolbar: ({ table }) => (
      <Flex justify="space-between" align="center" mt="xs" mb="sm" px="xs">
        <Group gap="xs" align="center">
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
            All ({rowCount})
          </Link>
        </Group>
        <Group gap="xs">
          <TextInput
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            leftSection={
              <FontAwesomeIcon
                icon={faSearch}
                style={{ fontSize: 14, color: "#666" }}
              />
            }
            rightSection={
              globalFilter && (
                <ActionIcon
                  variant="transparent"
                  onClick={() => setGlobalFilter("")}
                  style={{ cursor: "pointer" }}
                >
                  <FontAwesomeIcon
                    icon={faXmark}
                    style={{ fontSize: 14, color: "#666" }}
                  />
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
          <Menu shadow="md" width={200}>
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
              >
                ADD DATA
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                onClick={() =>
                  postParentMessage(bulkUploadSupplierLocationMaster())
                }
              >
                Bulk Upload Data
              </Menu.Item>
              <Menu.Item onClick={handleDownloadTemplate}>
                Download Template
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Flex>
    ),
    // Custom bottom toolbar with pagination + record range
    renderBottomToolbar: ({ table }) => {
      const startRow = pagination.pageIndex * pagination.pageSize + 1;
      const endRow = Math.min(
        rowCount,
        (pagination.pageIndex + 1) * pagination.pageSize
      );

      return (
        <Flex gap="sm" align="center" px="xs" py="xs">
          {rowCount > 0 && (
            <React.Fragment>
              <MRT_TablePagination table={table} />
              <Box>
                <Text fz="12px" c="#666666">
                  {startRow}–{endRow} of {rowCount}
                </Text>
              </Box>
            </React.Fragment>
          )}
        </Flex>
      );
    },
    // // Edit action in each row (commented out — action column removed per specs)
    // enableRowActions: true,
    // positionActionsColumn: "last",
    // renderRowActions: ({ row }) => {
    //   const mappingCount =
    //     row.original.SupplierLocationMappings_aggregate?.aggregate?.count ?? 0;
    //   const isDisabled = mappingCount > 0;

    //   return (
    //     <Tooltip
    //       label={
    //         isDisabled
    //           ? "This supplier location is mapped to activity data and cannot be edited"
    //           : "Edit supplier location"
    //       }
    //       withArrow
    //     >
    //       <ActionIcon
    //         variant="subtle"
    //         color="gray"
    //         disabled
    //         aria-label="Edit supplier location"
    //         onClick={() => {
    //           if (!isDisabled) {
    //             postParentMessage(
    //               addEditSupplierLocationMaster(true, row.original.id)
    //             );
    //           }
    //         }}
    //       >
    //         <EditIcon size={16} />
    //       </ActionIcon>
    //     </Tooltip>
    //   );
    // },
  });

  // Show loading spinner on first load
  if (isLoading && !hasEverLoaded) {
    return <Spinner />;
  }

  // Show empty state when no products exist and no search/filter active
  if (!isLoading && hasEverLoaded && rowCount === 0 && !debounced) {
    return (
      <SupplierLocationMasterEmptyState
        onDownloadTemplate={handleDownloadTemplate}
      />
    );
  }

  return (
    <MantineProvider>
      <Flex align="center" justify="space-between" mt="27px" mb="md">
        <Text fz="22px" c="#444444" fw="400" lh="normal">
          List of Supplier Locations
        </Text>
      </Flex>
      <MantineReactTable table={table} />
    </MantineProvider>
  );
};

export default SupplierLocationMasterListingTable;
