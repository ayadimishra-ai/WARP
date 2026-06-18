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
  Button,
  Flex,
  Group,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { type MRT_ColumnDef, type MRT_Icons } from "mantine-react-table";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useOrganizationDetails } from "~/hooks/use-organizaion-details";
import {
  addEditLocation,
  postParentMessage,
} from "~/shared/services/platform-window-message-service";
import { clientEnv } from "~/utils/env/env.client";
import EditIcon from "../icons/EditIcon";
import AddLocationPage from "../location-listing-add-location/addLocationPage";
import CommonTable from "./commonTable";
import classes from "./CSS.module.css";
config.autoAddCss = false;

type Location = {
  id: string;
  location_code: string;
  location_name: string;
  ownership_type: string;
  facility_type: string;
  location_full_address: string;
  WWTP: string;
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

const LocationListingTable = () => {
  const params = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [data, setData] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  // Server-side sorting state
  const [sorting, setSorting] = useState<
    {
      id: string;
      desc: boolean;
    }[]
  >([]);
  const isInitialLoad = useRef(true);
  const organizationDetails = useOrganizationDetails();

  const columns: MRT_ColumnDef<Location>[] = [
    {
      accessorKey: "location_code",
      header: "Location Code",
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return value && String(value).trim() !== "" ? String(value) : "-";
      },
    },
    {
      accessorKey: "location_name",
      header: "Location Name",
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return value && String(value).trim() !== "" ? String(value) : "-";
      },
    },
    {
      accessorKey: "location_type",
      header: "Location Type",
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return value && String(value).trim() !== "" ? String(value) : "-";
      },
    },
    {
      accessorKey: "ownership_type",
      header: "Ownership Type",
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return value && String(value).trim() !== "" ? String(value) : "-";
      },
    },
    {
      accessorKey: "facility_type",
      header: "Facility Type",
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return value && String(value).trim() !== "" ? String(value) : "-";
      },
    },
    {
      accessorKey: "location_full_address",
      header: "Location Full Address",
      Cell: ({ cell }) => {
        const value = cell.getValue();
        if (!value || String(value).trim() === "") return "-";

        const addressText = String(value);
        return (
          <Tooltip
            label={addressText}
            position="top"
            withArrow
            multiline
            w={300}
            styles={{
              tooltip: {
                backgroundColor: "#003B52",
                color: "#fff",
                fontSize: "12px",
                padding: "8px 12px",
                wordWrap: "break-word",
              },
            }}
          >
            <div
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: "context-menu",
                maxWidth: "200px",
              }}
            >
              {addressText}
            </div>
          </Tooltip>
        );
      },
    },
    //Conditionally include WWTP column
    ...(organizationDetails.hasWaterActivity && organizationDetails.hasWWTP
      ? [
          {
            accessorKey: "WWTP",
            header: "WWTP",
            Cell: ({ cell }: any) => {
              const value = cell.getValue();
              if (!value || String(value).trim() === "") return "-";

              const stringValue = String(value).toLowerCase().trim();
              if (stringValue === "yes") return "Yes";
              if (stringValue === "no") return "No";
              // For any other value, capitalize first letter
              return stringValue.charAt(0).toUpperCase() + stringValue.slice(1);
            },
          },
        ]
      : []),
  ];

  // Fetch data from API with pagination and search
  const fetchLocations = async () => {
    // Check if it's initial load or subsequent fetch
    if (isInitialLoad.current) {
      setLoading(true);
      isInitialLoad.current = false;
    } else {
      setIsRefetching(true);
    }

    try {
      // Build URL with pagination and search parameters
      const queryParams = new URLSearchParams({
        pageIndex: pagination.pageIndex.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      // Add search parameter if search term exists
      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        queryParams.append("search", debouncedSearchTerm.trim());
      }

      // Add sorting parameters if sorting is applied
      if (sorting.length > 0) {
        const sortBy = sorting[0].id;
        const sortOrder = sorting[0].desc ? "desc" : "asc";
        queryParams.append("sortBy", sortBy);
        queryParams.append("sortOrder", sortOrder);
      }

      const res = await fetch(
        `${clientEnv.NEXT_PUBLIC_API_BASE_URL}/api/v1/master-data/organization-locations/listing?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "x-sk-op-authorization": String(params?.accessToken as string),
            organization_id: String(params?.organizationId),
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch locations");
      }

      const result = await res.json();
      const apiData = result?.data || [];
      const paginationInfo = result?.pagination || {};

      setData(apiData);
      setTotalCount(paginationInfo.totalCount || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  };

  // Reset to initial load when organization or access token changes
  useEffect(() => {
    isInitialLoad.current = true;
  }, [params?.accessToken, params?.organizationId]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 200); // 200ms delay

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  // Reset pagination when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return; // Only reset when debounced value changes
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0, // Reset to first page when searching
    }));
  }, [debouncedSearchTerm, searchTerm]);

  // Reset pagination when sorting changes
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0, // Reset to first page when sorting changes
    }));
  }, [sorting]);

  useEffect(() => {
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearchTerm, sorting]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.currentTarget.value);
  };

  const tableConfig = {
    enableColumnFilters: false,
    enableGlobalFilter: false,
    enableDensityToggle: false,
    enableColumnActions: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    // Server-side pagination configuration
    manualPagination: true,
    manualSorting: true, // Enable server-side sorting
    rowCount: totalCount,
    state: {
      pagination,
      sorting,
      isLoading: loading, // Show loading only during initial data fetch
      showProgressBars: isRefetching, // Show progress bars during refetching
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
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

          <Button
            variant="unstyled"
            fw={600}
            fz={12}
            h={36}
            lts="0.15rem"
            p="0 20px"
            radius="xl"
            className="noAnimationButton filledGradientButton"
            onClick={() => {
              postParentMessage(addEditLocation(true, ""));
            }}
          >
            ADD NEW LOCATION
          </Button>
        </Flex>
      </Group>
    ),
    mantinePaperProps: {
      className: classes.LocationListingStyle,
    },
    mantineProgressProps: ({ isTopToolbar }: any) => ({
      color: "#72D0C6",
      style: { display: isTopToolbar ? "block" : "none" }, //only show top toolbar progress bar
      value: 100, //show precise real progress value if you so desire
    }),
    icons: faIcons,
    enableRowNumbers: true,
    rowNumberMode: "original",
    enablePagination: true,
    displayColumnDefOptions: {
      "mrt-row-actions": { size: 50, Header: "Action" },
      "mrt-row-select": { size: 20, Header: "" },
      "mrt-row-numbers": {
        size: 20,
        Header: "SN",
        mantineTableHeadCellProps: {
          style: {
            paddingTop: 14,
            fontSize: 12,
          },
        },
      },
    },
    enableRowActions: true,
    positionActionsColumn: "last",
    paginationDisplayMode: "pages",
    renderRowActions: ({ row }: any) => (
      <ActionIcon
        onClick={() => {
          postParentMessage(addEditLocation(true, row?.original?.id));
        }}
        disabled={row?.original?.isMapped === true}
      >
        <EditIcon />
      </ActionIcon>
    ),
  };

  // Show AddLocationPage only when:
  // 1. Not loading (initial load complete)
  // 2. Not refetching (no ongoing data fetch)
  // 3. No locations exist in the list
  // 4. We're on the first page (pageIndex = 0)
  // 5. No search filter is applied
  // 6. No sorting is applied (default state)
  const hasNoFiltersApplied =
    pagination?.pageIndex === 0 &&
    debouncedSearchTerm?.trim() === "" &&
    sorting?.length === 0;

  if (!loading && !isRefetching && data.length === 0 && hasNoFiltersApplied) {
    return <AddLocationPage />;
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
        List of Locations
      </h2>

      <CommonTable data={data} columns={columns} tableConfig={tableConfig} />
    </>
  );
};

export default LocationListingTable;
