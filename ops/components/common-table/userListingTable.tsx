// components/userListingTable.tsx
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
import { ActionIcon, Button, Flex, Group, TextInput } from "@mantine/core";
import { countries } from "country-data";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { type MRT_ColumnDef, type MRT_Icons } from "mantine-react-table";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  addEditUser,
  postParentMessage,
} from "~/shared/services/platform-window-message-service";
import { clientEnv } from "~/utils/env/env.client";
import EditIcon from "../icons/EditIcon";
import { CountryOption } from "../ui/PhoneNumberInput";
import AddUserPage from "../users-listing-add-users/addUserPage";
import CommonTable from "./commonTable";
import classes from "./CSS.module.css";

config.autoAddCss = false;

// Define the Person type to match the actual API response
type Person = {
  id: string;
  name: string;
  role: string;
  email: string;
  metadata: any;
  lastLoginDetails?: string;
};
dayjs.extend(utc);
dayjs.extend(timezone);
const columns: MRT_ColumnDef<Person>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableColumnFilter: false,
    Cell: ({ cell }) => {
      const value = cell.getValue();
      return value && String(value).trim() !== "" ? String(value) : "-";
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    enableColumnFilter: false,
    Cell: ({ row }) => {
      const role = row.original.role;
      const displayRole =
        role === "LocationExecutive"
          ? "Location Executive"
          : "Organization Admin";
      return displayRole || "-";
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    enableColumnFilter: false,
    Cell: ({ cell }) => {
      const value = cell.getValue();
      return value && String(value).trim() !== "" ? String(value) : "-";
    },
  },
  {
    accessorKey: "metadata",
    id: "mobile_number",
    header: "Mobile Number",
    enableColumnFilter: false,
    Cell: ({ row }) => {
      const metadata = row.original.metadata;
      return getMobileNumber(metadata);
    },
  },
  {
    accessorKey: "lastLoginDetails",
    id: "last_logged_in",
    header: "Last Logged In",
    enableColumnFilter: false,
    Cell: ({ row }) => {
      const lastLoginTime = row.original.lastLoginDetails;
      return lastLoginTime
        ? dayjs
            .utc(lastLoginTime)
            .tz(dayjs.tz.guess())
            .format("DD MMM YYYY, HH:mm")
        : "-";
    },
  },
];

const faIcons: Partial<MRT_Icons> = {
  IconArrowsSort: (props: any) => <FontAwesomeIcon icon={faSort} {...props} />,
  IconSortAscending: (props: any) => (
    <FontAwesomeIcon icon={faSortUp} {...props} />
  ),
  IconSortDescending: (props: any) => (
    <FontAwesomeIcon icon={faSortDown} {...props} />
  ),
};
const countryOptions: CountryOption[] = countries.all
  .filter((c) => c.countryCallingCodes.length > 0)
  .map((c) => ({
    value: c.alpha2,
    label: c.name,
    flag: null,
    dialCode: c.countryCallingCodes[0],
  }));
const getMobileNumber = (metaData: any) => {
  if (!metaData?.mobile) {
    return "-";
  }
  const country = countryOptions.find(
    (c) => c.value === metaData?.mobileCountryCode
  );
  if (!country?.dialCode) {
    return `+91 ${metaData?.mobile}`;
  }
  return country ? `${country.dialCode} ${metaData?.mobile}` : "-";
};
const UserListingTable = () => {
  const params = useParams();
  const [userList, setuserList] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [isRefetching, setIsRefetching] = useState<Boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const isInitialLoad = useRef(true);
  // Server-side pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalCount, setTotalCount] = useState(0);
  // Server-side sorting state
  const [sorting, setSorting] = useState<
    {
      id: string;
      desc: boolean;
    }[]
  >([]);

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

  // Reset to initial load when organization or access token changes
  useEffect(() => {
    isInitialLoad.current = true;
  }, [params?.accessToken, params?.organizationId]);

  useEffect(() => {
    const getUserData = async () => {
      // Check if it's initial load or subsequent fetch
      if (isInitialLoad.current) {
        setIsLoading(true);
        isInitialLoad.current = false;
      } else {
        setIsRefetching(true);
      }

      // Build URL with pagination, search, and sorting parameters
      const queryParams = new URLSearchParams({
        pageIndex: pagination.pageIndex.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      // Add search parameter if search term exists
      if (debouncedSearchTerm.trim()) {
        queryParams.append("search", debouncedSearchTerm.trim());
      }

      // Add sorting parameters if sorting is applied
      if (sorting.length > 0) {
        const sortBy = sorting[0].id;
        const sortOrder = sorting[0].desc ? "desc" : "asc";
        queryParams.append("sortBy", sortBy);
        queryParams.append("sortOrder", sortOrder);
      }

      const userData = await fetch(
        clientEnv.NEXT_PUBLIC_API_BASE_URL +
          "/api/v1/master-data/users/listing?" +
          queryParams.toString(),
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            "x-sk-op-authorization": String(params?.accessToken as string),
            organization_id: String(params?.organizationId),
          },
        }
      ).then((response) => {
        if (response?.statusText == "OK" && response?.status == 200) {
          return response.json();
        }
      });

      // Set total count from server response
      setTotalCount(userData?.data?.pagination?.totalCount || 0);

      // Use raw data directly from API - no transformation needed
      setuserList(userData?.data?.userList || []);

      setIsLoading(false);
      setIsRefetching(false);
    };
    getUserData();
  }, [
    params?.accessToken,
    params?.organizationId,
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearchTerm,
    sorting,
  ]);

  // Since we're using server-side search, just use the userList directly
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.currentTarget.value);
  };
  const tableConfig = {
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
              postParentMessage(addEditUser(true, ""));
            }}
          >
            ADD NEW USER
          </Button>
        </Flex>
      </Group>
    ),
    enableRowNumbers: true,
    rowNumberMode: "original",
    icons: faIcons,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableMultiRowSelection: false, //use radio buttons instead of checkboxes
    enableRowSelection: true,
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      pagination: { pageSize: 10, pageIndex: 0 },
    },
    state: {
      pagination,
      sorting,
      isLoading: isLoading, // Show loading only during initial data fetch
      showProgressBars: isRefetching, // Show progress bars during refetching
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount: totalCount,
    columnFilterDisplayMode: "popover",
    manualFiltering: false,
    manualPagination: true, // Enable server-side pagination
    manualSorting: true, // Enable server-side sorting
    enableFilterMatchHighlighting: false,
    enableColumnFilters: true,
    paginationDisplayMode: "pages",
    enablePagination: true,
    mantinePaginationProps: {
      style: {
        border: 0,
      },
    },
    getRowId: (row: Person) => row.name || String(row), //give each row a more useful id
    mantineTableBodyRowProps: ({ row }: any) => ({
      //add onClick to row to select upon clicking anywhere in the row
      onClick: row.getToggleSelectedHandler(),
      sx: { cursor: "pointer" },
    }),
    mantineSelectCheckboxProps: { color: "#72D0C6", size: "sm" },
    positionToolbarAlertBanner: "none",
    mantinePaperProps: { className: classes.FormTablestyle },
    mantineSearchTextInputProps: {
      style: {
        borderRadius: 20,
      },
      placeholder: "Search...",
      clearable: true,
      leftSection: (
        <FontAwesomeIcon
          icon={faSearch}
          style={{ marginLeft: 15, fill: "#666" }}
        />
      ),
    },
    mantineProgressProps: ({ isTopToolbar }: any) => ({
      color: "#72D0C6",
      style: { display: isTopToolbar ? "block" : "none" }, //only show top toolbar progress bar
      value: 100, //show precise real progress value if you so desire
    }),
    enableGlobalFilter: false,
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
            paddingLeft: 10,
          },
        },
      },
    },
    enableRowActions: true,
    positionActionsColumn: "last",
    renderRowActions: ({ row }: any) => (
      <ActionIcon
        onClick={() => {
          postParentMessage(addEditUser(true, row?.original?.id));
        }}
      >
        <EditIcon />
      </ActionIcon>
    ),
  };

  // Show AddUserPage only when:
  // 1. Not loading
  // 2. No users exist in the list
  // 3. We're on the first page (pageIndex = 0)
  // 4. No search/filter is applied
  // 5. No sorting is applied (default state)
  const hasNoFiltersApplied =
    pagination?.pageIndex === 0 &&
    debouncedSearchTerm?.trim() === "" &&
    sorting?.length === 0;

  if (
    !isLoading &&
    !isRefetching &&
    userList.length === 0 &&
    hasNoFiltersApplied
  ) {
    return <AddUserPage />;
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
        List of Users
      </h2>

      <CommonTable
        data={userList}
        columns={columns}
        tableConfig={tableConfig}
      />
    </>
  );
};

export default UserListingTable;
