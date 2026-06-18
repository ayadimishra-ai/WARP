"use client";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Container,
  createTheme,
  Flex,
  Group,
  MantineProvider,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconBan,
  IconCaretDownFilled,
  IconCaretUpDownFilled,
  IconCaretUpFilled,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import {
  MantineReactTable,
  MRT_GlobalFilterTextInput,
  MRT_PaginationState,
  MRT_TablePagination,
  useMantineReactTable,
  type MRT_Cell,
  type MRT_ColumnDef,
  type MRT_Icons,
} from "mantine-react-table";
import React, { useEffect, useMemo, useState } from "react";
import { BuyerSupplierAddressMappings } from "@/modules/ghg/graphql/shared/types";
import { useOrganizationDetails } from "@/modules/ghg/hooks/use-organizaion-details";
import { useUserSession } from "@/modules/ghg/hooks/use-user-session";
import { OPSOrgRole } from "@/modules/ghg/lib/op-database/types";
import {
  CustomHeaderFilter,
  excludeArray,
} from "@/modules/ghg/lib/shared/constants/dataimporthistory.constant";
import { toTitleCase } from "@/modules/ghg/lib/shared/constants/input.constant";
import { addressTypeAllowedActivity } from "@/modules/ghg/shared/constants/input.constant";
import {
  BuyerActivityStatus,
  DataLog,
  FilterCount,
  recordStatus,
  Status,
} from "@/modules/ghg/shared/constants/supplier-flow.constant";
import Spinner from "@/modules/ghg/shared/UI/spinner/spinner";
import SearchIcon from "../icons/SearchIcon";
import {
  getAccociatedBuyers,
  getMonthlyActivityData,
  getUserRoleAction,
  mappedActivityData,
} from "./activity-data-records-server-action";
const faIcons: Partial<MRT_Icons> = {
  IconArrowsSort: (props: any) => (
    <IconCaretUpDownFilled size={6.5} {...props} />
  ),
  IconSortAscending: (props: any) => (
    <IconCaretUpFilled size={6.5} {...props} />
  ),
  IconSortDescending: (props: any) => (
    <IconCaretDownFilled size={6.5} {...props} />
  ),
};

// Define statusIcons with React.ReactNode instead of JSX.Element
const statusIcons: Record<Status, React.ReactNode> = {
  completed: (
    <IconCheck width="24px" height="24px" color="#52E383" stroke={3} />
  ),
  pending: <IconX width="24px" height="24px" color="#FF8080" stroke={3} />,
  na: <IconBan size={24} color="#FFA93C" stroke={2} />,
};

const theme = createTheme({
  components: {
    Loader: {
      styles: {
        root: {
          top: "23px",
        },
      },
    },
    Text: {
      styles: {
        root: {
          fontSize: "14px",
          fontStyle: "normal",
          fontWeight: 400,
          lineHeight: "normal",
          color: "rgba(34, 51, 84, 0.50)",
        },
      },
    },
    Table: {
      styles: {
        // table: {
        //   boxShadow:
        //     "rgba(159, 162, 191, 0.18) 0px 9px 16px, rgba(159, 162, 191, 0.32) 0px 2px 2px",
        //   borderRadius: 10,
        //   marginBottom: 25,
        // },
        tbody: {
          borderBottomLeftRadius: "10px",
          borderBottomRightRadius: "10px",
        },
        th: {
          maxHeight: 43,
          fontWeight: "bold",
          backgroundColor: "#f8f9fa !important",
        },
        td: {
          color: "red!important",
          fontWeight: 400,
        },
      },
    },
    Popover: {
      styles: {
        dropdown: {
          zIndex: 9999,
        },
      },
    },
    TextInput: {
      styles: {
        input: {
          paddingLeft: 46,
          borderRadius: 20,
          "--input-bd-focus": "transparent",
          width: "250px",
        },
      },
    },
    ActionIcon: {
      styles: {
        color: "#454545",
        backgroundColor: "#000",
      },
    },
  },
});

// Component definition
const MonthlyDataRecords: React.FC = () => {
  const session: any = useUserSession();
  const [data, setData] = useState<DataLog[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingColumns, setIsLoadingColumns] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [filteredValue, setFilteredValue] = useState<any>([]);
  const [ActivityList, setActivityList] = useState<any>([]);
  const [allFilterCount, setAllFilterCount] = useState<FilterCount>({
    total_count: 0,
    completed: 0,
    pending: 0,
  });
  const [buyerList, setBuyerList] = useState<BuyerSupplierAddressMappings[]>(
    []
  );
  const [userRole, setUserRole] = useState<String>("");
  const [dataSource, setDataSource] = useState("initial");
  const [debounced] = useDebouncedValue(globalFilter ?? "", 200);
  const [refetchData, setRefetchData] = useState(false);
  const organizationDetails = useOrganizationDetails();

  //Set pagination and global filter when receiving a message
  useEffect(() => {
    const handleMessage = (event: any) => {
      if (event.data === "callApi") {
        setPagination({
          pageIndex: 0,
          pageSize: 10,
        });
        setGlobalFilter("");
        setRefetchData(true);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);
  // Function to filter data based on address type, org address type, activity name, and status
  const getData = (
    addressType: string,
    orgAddressType: string,
    activityName: string,
    status: string
  ) => {
    let finalStatus: string = status;
    const addressTypeData = addressTypeAllowedActivity.filter(
      (items) => items?.name == addressType
    );
    const DataAvailable = addressTypeData[0].data.filter(
      (dataItem) =>
        dataItem.code == orgAddressType &&
        dataItem.childActivity.filter(
          (item) =>
            String(item).toLocaleLowerCase() ==
            String(activityName).toLocaleLowerCase()
        ).length > 0
    );
    if (DataAvailable.length == 0) {
      finalStatus = BuyerActivityStatus.na;
    }
    if (
      organizationDetails.hasWWTP === false &&
      activityName === "waste_water_treatment"
    ) {
      finalStatus = BuyerActivityStatus.na;
    }
    // if (
    //   !!organizationDetails.hasWaterActivity &&
    //   !!organizationDetails.hasWWTP === false &&
    //   activityName === "waste_water_treatment"
    // ) {
    //   finalStatus = BuyerActivityStatus.na;
    // }
    return finalStatus;
  };

  /**
   * Fetch activity data when;
   * 1. Component mounts
   * 2. Filter, pagination or search value changes.
   */
  useEffect(() => {
    if (session?.organizationId) {
      fetchActivityData();
    }
  }, [
    refetchData,
    session,
    pagination.pageIndex,
    pagination.pageSize,
    debounced,
    filter,
  ]);

  //function to fetch activity data
  const fetchActivityData = async () => {
    if (!data?.length && dataSource == "initial") {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }
    try {
      if (!!session?.organizationId) {
        const userRole = await getUserRoleAction(session?.organizationId!);
        setUserRole(userRole);

        const allowedAddressList =
          "('" +
          session?.mappings
            .map((items: any) => items.organization_address_id)
            .join("','") +
          "')";

        const data: any = await getMonthlyActivityData({
          organizationId: session?.organizationId,
          userId: session?.userId,
          addressList: allowedAddressList,
          pagination: pagination,
          searchByAssementStatus:
            filter == "all"
              ? `('completed', 'pending', 'na')`
              : `('${filter}')`,
          search: globalFilter,
        });

        //setGlobalFilter("");
        setFilteredValue(data[0]?.source == "initial" ? data : []);
        setDataSource(data[0]?.source);

        setAllFilterCount({
          total_count:
            Number(data[0]?.completedcount) + Number(data[0]?.pendingcount) ||
            0,
          completed: Number(data[0]?.completedcount) || 0,
          pending: Number(data[0]?.pendingcount) || 0,
        });
        setRowCount(
          filter == "completed"
            ? Number(data[0]?.completedcount)
            : filter == "pending"
              ? Number(data[0]?.pendingcount)
              : Number(data[0]?.completedcount) + Number(data[0]?.pendingcount)
        );
        setIsLoading(false);
        setIsRefetching(false);
        setRefetchData(false);
      }
    } catch (err) {
      console.log(err);
      setIsLoading(false);
      setIsRefetching(false);
      setRefetchData(false);
    }
  };
  // Fetch activity data and associated buyers when the component mounts or when session changes
  useEffect(() => {
    const getActivityMapped = async () => {
      if (!!session?.organizationId) {
        setIsLoadingColumns(true);
        const Buyerdata: BuyerSupplierAddressMappings[] =
          await getAccociatedBuyers(session?.organizationId);
        setBuyerList(Buyerdata);
        const Act = await mappedActivityData(session?.organizationId);
        setActivityList(Act);
        setIsLoadingColumns(false);
      }
    };
    if (session?.organizationId && session?.userRole) {
      getActivityMapped();
    }
  }, [session]);
  const allActivitiesList: any = ActivityList?.filter(
    (x: any) =>
      x?.Activity?.code !== "grievances" &&
      x?.Activity?.code !== "boardandgovernance" &&
      x?.Activity?.code !== "humanresources" &&
      x?.Activity?.code !== "csr_master" &&
      x?.Activity?.code !== "healthandsafety"
  )
    .map((item: any) => {
      if (!!item.Activity.Activities && item.Activity.Activities?.length > 0) {
        return item.Activity.Activities?.map((activity: any) => activity.code);
      } else {
        return item.Activity.code;
      }
    })
    .flat();
  const ActivitiesList =
    buyerList.length == 0
      ? allActivitiesList.filter((item: string) => item !== "buyer_share")
      : allActivitiesList?.filter(
          (activity: string) => !excludeArray.includes(activity)
        );
  const ListOfActivities: any = ActivitiesList?.map((activity: string) => {
    const columnInfo = CustomHeaderFilter.find(
      (item) => item.activity_code === activity
    );
    return {
      id: activity,
      accessorKey: activity,
      header: columnInfo?.shortName,
      Header: () => (
        <Tooltip
          offset={0}
          position="bottom-start"
          label={columnInfo?.activity}
        >
          <span>{columnInfo?.shortName}</span>
        </Tooltip>
      ),
      maxSize: 70,
      Cell: ({ cell }: { cell: MRT_Cell<DataLog> }) => {
        if (activity === "buyer_share") {
          const value = cell.getValue<number>();
          const formattedValue = value.toString().padStart(2, "0") || value;
          return (
            <Box style={{ pointerEvents: value === 0 ? "none" : "all" }}>
              {Number(formattedValue) > 0 ? (
                <Tooltip
                  offset={0}
                  position="bottom-start"
                  label="Click to View Details"
                >
                  <Badge
                    circle
                    color="#7FAAFF"
                    size="23px"
                    component="a"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      if (value > 0) {
                        localStorage.setItem(
                          "buyer-share-params",
                          JSON.stringify({
                            month: cell.row.original.month.split(" ")[0],
                            year: cell.row.original.month.split(" ")[1],
                            orgnization_address:
                              cell.row.original.organizationaddress,
                            organizationId: session?.organizationId,
                          })
                        );
                        window.parent.postMessage("OpenBuyerShareDetails", "*");
                      }
                    }}
                  >
                    <Text c="#000000" fz="10px">
                      {formattedValue}
                    </Text>
                  </Badge>
                </Tooltip>
              ) : (
                <Badge
                  circle
                  color="#7FAAFF"
                  size="23px"
                  component="a"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (value > 0) {
                      localStorage.setItem(
                        "buyer-share-params",
                        JSON.stringify({
                          month: cell.row.original.month.split(" ")[0],
                          year: cell.row.original.month.split(" ")[1],
                          orgnization_address:
                            cell.row.original.organizationaddress,
                          organizationId: session?.organizationId,
                        })
                      );
                      window.parent.postMessage("OpenBuyerShareDetails", "*");
                    }
                  }}
                >
                  <Text c="#000000" fz="10px">
                    {formattedValue}
                  </Text>
                </Badge>
              )}
            </Box>
          );
        } else {
          const status = cell.getValue<any>();
          return statusIcons[status as keyof typeof statusIcons] || null;
        }
      },
    };
  });

  // console.log("ListOfActivities 1", ListOfActivities);

  // console.log("ListOfActivities 2", uniqueListOfActivities);

  if (ActivitiesList.length > 0) {
    ListOfActivities?.splice(ListOfActivities.length, 0, {
      accessorKey: "status",
      header: "Status",
      size: 82,
      Cell: ({ row }: { row: { original: DataLog } }) => {
        const status = row.original.assesmentstatus;
        return (
          <Button
            color={
              status === BuyerActivityStatus.Completed ? "#03F4AC" : "#FF9907"
            }
            radius="xl"
            styles={{
              root: {
                color: "#000000",
                pointerEvents: "none",
                fontSize: "10px",
                lineHeight: "inherit",
                fontWeight: "400",
                padding: "3px 8px",
                height: "20px",
              },
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        );
      },
    });
  }

  //changed by satej to remove duplicate columns
  // const columns = useMemo<MRT_ColumnDef<DataLog>[]>(
  //   () => [
  //     { accessorKey: "location", header: "Location", size: 80 },
  //     { accessorKey: "month", header: "Month", size: 80 },
  //     ...(Array.isArray(ListOfActivities) ? ListOfActivities : []),
  //   ],
  //   [ListOfActivities]
  // );

  //render columns with unique accessorKeys: Activity columns dynamically
  const columns = useMemo<MRT_ColumnDef<DataLog>[]>(() => {
    const baseColumns: MRT_ColumnDef<DataLog>[] = [
      { accessorKey: "location", header: "Location", size: 80 },
      { accessorKey: "month", header: "Month", size: 80 },
    ];

    const activityColumns = Array.isArray(ListOfActivities)
      ? ListOfActivities
      : [];

    // Remove duplicates based on accessorKey
    const uniqueColumns: MRT_ColumnDef<DataLog>[] = Array.from(
      new Map(
        [...baseColumns, ...activityColumns].map((item) => [
          item.accessorKey,
          item,
        ])
      ).values()
    );

    return uniqueColumns;
  }, [ListOfActivities]);

  useEffect(() => {
    const fetchData = async () => {
      const tableData: any = [];
      if (filteredValue.length > 0) {
        setIsLoading(true);
        filteredValue?.forEach((task: any) => {
          let date = toTitleCase(task.month) + " " + task.year;
          let activityObject = {
            month: date,
            location: task.address,
            energy_fuel_purchased:
              userRole == OPSOrgRole?.SUPPLIER
                ? task?.energy_fuel_purchased
                : getData(
                    task?.type,
                    task?.address_type,
                    "energy_fuel_purchased",
                    task?.energy_fuel_purchased
                  ),
            energy_grid_power:
              userRole == OPSOrgRole?.SUPPLIER
                ? task?.energy_grid_power
                : getData(
                    task?.type,
                    task?.address_type,
                    "energy_grid_power",
                    task?.energy_grid_power
                  ),
            energy_captive_power:
              userRole == OPSOrgRole?.SUPPLIER
                ? task?.energy_captive_power
                : getData(
                    task?.type,
                    task?.address_type,
                    "energy_captive_power",
                    task?.energy_captive_power
                  ),
            waste:
              userRole == OPSOrgRole?.SUPPLIER
                ? task?.waste
                : getData(task?.type, task?.address_type, "waste", task?.waste),
            water:
              userRole == OPSOrgRole?.SUPPLIER
                ? task?.water
                : getData(task?.type, task?.address_type, "water", task?.water),
            transport_upstream:
              userRole == OPSOrgRole?.SUPPLIER
                ? task?.transport_upstream
                : getData(
                    task?.type,
                    task?.address_type,
                    "transport_upstream",
                    task?.transport_upstream
                  ),
            general:
              userRole == OPSOrgRole?.SUPPLIER
                ? task?.general
                : getData(
                    task?.type,
                    task?.address_type,
                    "general",
                    task?.general
                  ),
            production:
              userRole == OPSOrgRole?.SUPPLIER
                ? task?.production
                : getData(
                    task?.type,
                    task?.address_type,
                    "production",
                    task?.production
                  ),
            transport_downstream:
              userRole == OPSOrgRole?.SUPPLIER
                ? task?.transport_downstream
                : getData(
                    task?.type,
                    task?.address_type,
                    "transport_downstream",
                    task?.transport_downstream
                  ),
            transport_employee_travel:
              userRole == OPSOrgRole?.SUPPLIER
                ? task?.transport_employee_travel
                : getData(
                    task?.type,
                    task?.address_type,
                    "transport_employee_travel",
                    task?.transport_employee_travel
                  ),
            transport_business_travel:
              userRole == OPSOrgRole?.SUPPLIER
                ? task?.transport_business_travel
                : getData(
                    task?.type,
                    task?.address_type,
                    "transport_business_travel",
                    task?.transport_business_travel
                  ),
            material_procurement:
              userRole == OPSOrgRole?.SUPPLIER
                ? task?.material_procurement
                : getData(
                    task?.type,
                    task?.address_type,
                    "material_procurement",
                    task?.material_procurement
                  ),
            water_consumption:
              userRole == OPSOrgRole?.SUPPLIER
                ? task?.water_consumption
                : getData(
                    task?.type,
                    task?.address_type,
                    "water_consumption",
                    task?.water_consumption
                  ),
            water_withdrawal:
              userRole == OPSOrgRole?.SUPPLIER
                ? task?.water_withdrawal
                : getData(
                    task?.type,
                    task?.address_type,
                    "water_withdrawal",
                    task?.water_withdrawal
                  ),
            wastewater_generation:
              userRole == OPSOrgRole?.SUPPLIER
                ? task?.wastewater_generation
                : getData(
                    task?.type,
                    task?.address_type,
                    "wastewater_generation",
                    task?.wastewater_generation
                  ),
            waste_water_treatment:
              userRole == OPSOrgRole?.SUPPLIER
                ? task?.waste_water_treatment
                : getData(
                    task?.type,
                    task?.address_type,
                    "waste_water_treatment",
                    task?.waste_water_treatment
                  ),
            fugitive_details:
              userRole == OPSOrgRole?.SUPPLIER
                ? ""
                : getData(
                    task?.type,
                    task?.address_type,
                    "fugitive_details",
                    task?.fugitive_details
                  ),
            product_share_allocation:
              userRole == OPSOrgRole?.SUPPLIER
                ? task?.product_share_allocation
                : getData(
                    task?.type,
                    task?.address_type,
                    "product_share_allocation",
                    task?.product_share_allocation
                  ),
            organizationaddress: task.organizationaddress,
            buyer_share: task.buyer_share,
            assesmentstatus: task.assesmentstatus,
            capital_goods: task.capital_goods,
            use_of_sold_products: task.use_of_sold_products,
          };
          tableData.push(activityObject);
        });
        setData(tableData);
        setIsLoading(false);
      } else {
        setData(tableData);
      }
    };
    fetchData();
  }, [filteredValue, buyerList, userRole]);
  const [isFocused, setIsFocused] = useState(false);
  const handleFilter = (value: string) => {
    setFilter(value as "all" | "completed" | "pending");
    setPagination({
      pageIndex: 0, // Set pageIndex to 0
      pageSize: 10, // Set pageSize to 10
    });
  };

  const table = useMantineReactTable({
    icons: faIcons,
    // enablePagination: true,
    columns,
    data,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableRowSelection: false,
    //onColumnFiltersChange: setColumnFilters,
    initialState: { showColumnFilters: true, showGlobalFilter: true },
    columnFilterDisplayMode: "popover",
    manualFiltering: true,
    manualPagination: true,
    enableFilterMatchHighlighting: false,
    enableColumnFilters: false,
    paginationDisplayMode: "pages",
    localization: {
      rowsPerPage: "Items per page:", // Change "Rows per page" to "Items per page"
    },
    // mantinePaperProps: { className: classes.tableStyling },
    rowCount,
    onGlobalFilterChange: (value: string) => {
      setGlobalFilter(value || "");
      setPagination({ ...pagination, pageIndex: 0 });
    },
    onPaginationChange: setPagination,
    mantineSearchTextInputProps: {
      placeholder: "Search...",
      className: isFocused
        ? "search-custmize-focused search-custmize-div"
        : "search-custmize-div",
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
      // className: classes.searchInputClass,
      styles: {
        input: {
          border: isFocused ? "1px solid #005C81" : "",
          color: "#666" + "!important",
          opacity: 1,
        },
      },
      leftSection: <SearchIcon color={isFocused ? "#005C81" : "#666666"} />,
    },
    state: {
      pagination,
      globalFilter,
      isLoading: isRefetching,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
    },
    enableRowNumbers: true,
    displayColumnDefOptions: {
      "mrt-row-numbers": { Header: "SN" },
      "mrt-row-actions": { size: 50 },
    },
    positionActionsColumn: "last",
    enableTopToolbar: true,
    enableGlobalFilter: true,
    enableFilters: true,
    enableSorting: true,

    renderTopToolbar: ({ table }) => (
      <Flex justify="space-between" mt="xs" mb="sm">
        <Group className="listing-page-topper-title">
          {["all", "completed", "pending"].map((value) => {
            const label = value.charAt(0).toUpperCase() + value.slice(1);
            const count =
              value === "all"
                ? allFilterCount?.total_count
                : value === "completed"
                  ? allFilterCount?.completed
                  : allFilterCount?.pending;
            return (
              <Button
                key={value}
                p="0"
                variant="transparent"
                color={filter === value ? "#FF9E1B" : "#666666"}
                onClick={() => handleFilter(value)}
                styles={{
                  root: {
                    fontSize: "14px",
                    lineHeight: "24px",
                  },
                }}
              >
                {label} ({count})
              </Button>
            );
          })}
        </Group>
        <Group gap="xs" className="MAD-Table-content">
          <ActionIcon
            variant="transparent"
            size="25px"
            className="MAD-Table-hiddenContent"
          >
            {/* <SquareRedirect /> */}
          </ActionIcon>
          <MRT_GlobalFilterTextInput table={table} radius={"xl"} />
        </Group>
      </Flex>
    ),
    renderBottomToolbar: ({ table }) => {
      const startRow = pagination.pageIndex * pagination.pageSize + 1;
      const endRow = Math.min(
        rowCount,
        (pagination.pageIndex + 1) * pagination.pageSize
      );

      return (
        <Flex gap="sm" align={"center"}>
          {table.getPrePaginationRowModel().rows?.length != 0 && (
            <React.Fragment>
              <MRT_TablePagination table={table} />
              <Box
                mt={10}
                style={{
                  textWrap: "nowrap",
                  order: 1,
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "normal",
                  color: "rgba(34, 51, 84, 0.5)",
                  marginLeft: "-11px",
                }}
              >
                {`${startRow}-${endRow} of ${rowCount}`}
              </Box>
            </React.Fragment>
          )}
        </Flex>
      );
    },
    mantineProgressProps: ({ isTopToolbar }) => ({
      color: "#72D0C6",
      style: { display: isTopToolbar ? "block" : "none" }, //only show top toolbar progress bar
      value: 100, //show precise real progress value if you so desire
    }),
  });

  return (
    <Container fluid p={0} className="themeTable activity-data-record-table">
      <Flex gap="sm" align="center">
        <Text fz="16px" lh="24px" fw="600" c={"#162F4B"}>
          Activity Data Records
        </Text>
        <Group
          p="0 15px"
          gap="0"
          bg="#F1F3F6"
          styles={(theme) => ({
            root: {
              borderRadius: theme.radius.xl,
              color: "#000000",
              height: 34,
            },
          })}
        >
          {[
            recordStatus.Completed,
            recordStatus.Pending,
            recordStatus.NotApplicable,
          ].map((label, index) => (
            <Flex
              key={label}
              style={{ padding: "0 5px 0 0" }}
              p="0 5px 0 0"
              gap="5px"
              align="center"
            >
              {Object.values(statusIcons)[index]}
              <Text c="#000" fz="12px" lh="24px">
                {label}
              </Text>
            </Flex>
          ))}
        </Group>
      </Flex>
      {isLoading || isLoadingColumns ? (
        <div
          style={{
            display: "block",
            position: "absolute",
            width: "100%",
            height: "100vh",
            background: "rgba(255,255,255,.8)",
          }}
        >
          <Spinner />
        </div>
      ) : (
        <div className="DefaultUI-change">
          <MantineProvider theme={theme}>
            <MantineReactTable table={table} />
          </MantineProvider>
        </div>
      )}
    </Container>
  );
};

export default MonthlyDataRecords;
