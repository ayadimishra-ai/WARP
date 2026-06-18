import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { faSortDown, faSortUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ActionIcon,
  Box,
  Flex,
  MantineProvider,
  Stack,
  Text,
  Tooltip,
  createTheme,
} from "@mantine/core";
import dayjs from "dayjs";
import {
  MRT_TablePagination,
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_Icons,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "mantine-react-table";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGetDataImportHistoryCountsViewLazyQuery } from "~/graphql/queries/get-data-import-history-counts-view.generated";
import { useGetDataImportHistoryViewLazyQuery } from "~/graphql/queries/get-data-import-history-view.generated";
import { Order_By } from "~/graphql/shared/types";
import { useUserSession } from "~/hooks/use-user-session";
import {
  AppRoles,
  CustomHeaderFilter,
  DataImportHistoryStatus,
} from "~/lib/shared/constants/dataimporthistory.constant";
import { isAIEnable } from "~/utils/jwt/getUserDataFromToken";
import SearchIcon from "../icons/SearchIcon";
import DownloadIcon from "../icons/TableDownloadIcon";
import ExclamationIcon from "../icons/TableExclamationIcon";
import classes from "./CSS.module.css";
import { DataImportHistoryToolbar } from "./DataImportHistoryToolbar";
import { useDataImportHistoryToolbarActions } from "./useDataImportHistoryToolbarActions";
config.autoAddCss = false;

export type TCustomFilter = { id: string; value: string };

export interface DataImportHistoryTableProps {
  initialActivityCode?: string | null;
  showGlobalFilter?: boolean;
  disableUploadDownload?: boolean;
}

export type TBulkImport = {
  file_name: string;
  sn: number;
  section: string;
  //filename: string;
  date: string;
  uploadedby: string;
  status: string;
  action: string;
  file_url: string;
  file_log_url: string;
  full_address: string;
};

const faIcons: Partial<MRT_Icons> = {
  IconArrowsSort: (props: any) => (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <FontAwesomeIcon
        icon={faSortUp}
        {...props}
        style={{
          ...props?.style,
          opacity: "1 !important",
          fontSize: "14px",
          marginBottom: "0",
          color: "#ffffff !important",
        }}
      />
      <FontAwesomeIcon
        icon={faSortDown}
        {...props}
        style={{
          ...props?.style,
          opacity: "1 !important",
          fontSize: "14px",
          marginTop: "-13px",
          color: "#ffffff !important",
        }}
      />
    </div>
  ),
  IconSortAscending: (props: any) => (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <FontAwesomeIcon
        icon={faSortUp}
        {...props}
        style={{
          ...props?.style,
          opacity: "1 !important",
          fontSize: "14px",
          marginBottom: "0",
          color: "#ffffff !important",
        }}
      />
      <FontAwesomeIcon
        icon={faSortDown}
        {...props}
        style={{
          ...props?.style,
          opacity: 0.4,
          fontSize: "14px",
          marginTop: "-13px",
          color: "#ffffff",
        }}
      />
    </div>
  ),
  IconSortDescending: (props: any) => (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <FontAwesomeIcon
        icon={faSortUp}
        {...props}
        style={{
          ...props?.style,
          opacity: 0.4,
          fontSize: "14px",
          marginBottom: "0",
          color: "#ffffff",
        }}
      />
      <FontAwesomeIcon
        icon={faSortDown}
        {...props}
        style={{
          ...props?.style,
          opacity: "1 !important",
          fontSize: "14px",
          marginTop: "-13px",
          color: "#ffffff !important",
        }}
      />
    </div>
  ),
};

const DataImportHistoryTable: React.FC<DataImportHistoryTableProps> = ({
  initialActivityCode = null,
  showGlobalFilter = true,
  disableUploadDownload = false,
}) => {
  //data and fetching state
  const [data, setData] = useState<TBulkImport[]>([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [allFilterCount, setAllFilterCount] = useState(0);
  const [isBulkImported, setBulkImported] = useState(false);
  const [customFilterValue, setcustomFilterValue] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState<string[]>([]);

  const [fetchDataImportHistoryList] = useGetDataImportHistoryViewLazyQuery();
  const [fetchDataImportHistoryCounts] =
    useGetDataImportHistoryCountsViewLazyQuery();
  const session: any = useUserSession();

  const [getCustomSectionFilterCount, setCustomSectionFilterCount] =
    useState<any>([]);

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const params = useParams();
  const isAIEnabled = isAIEnable(params?.accessToken as string | string[]);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [allLocations, setAllLocations] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const prevActivityCodeRef = useRef<string | null>(initialActivityCode);

  useEffect(() => {
    const nextActivityCode = initialActivityCode ?? null;
    if (prevActivityCodeRef.current === nextActivityCode) {
      return;
    }

    // Reset all table-level filters and view state when activity changes.
    setSelectedLocation([]);
    setColumnFilters([]);
    setGlobalFilter("");
    setSorting([]);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    setcustomFilterValue("All");
    setData([]);

    prevActivityCodeRef.current = nextActivityCode;
  }, [initialActivityCode]);

  // Once allLocations is populated for the first time, pre-select all of them
  // so every checkbox appears checked by default (mirrors "no filter" server behaviour).
  useEffect(() => {
    if (allLocations.length > 0 && selectedLocation.length === 0) {
      setSelectedLocation(allLocations.map((l) => l.value));
    }
    // Only run when allLocations changes — intentionally omitting selectedLocation
    // to avoid re-running after the user manually deselects items.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLocations]);

  // Dedicated effect to fetch all unique locations for the dropdown (not limited by pagination)
  useEffect(() => {
    const fetchAllLocations = async () => {
      if (!session) return;
      let baseWhere: object = {};
      if (session?.userRole === AppRoles.LocationExecutive) {
        baseWhere = {
          organization_id: { _eq: session?.organizationId },
          uploader_user_id: { _eq: session.userId },
        };
      } else {
        baseWhere = { organization_id: { _eq: session?.organizationId } };
      }
      if (initialActivityCode) {
        baseWhere = {
          _and: { ...baseWhere, activity_code: { _eq: initialActivityCode } },
        };
      }
      try {
        const response = await fetchDataImportHistoryList({
          variables: {
            where: baseWhere,
            start: 0,
            size: 9999,
            orderBy: { created_at: Order_By.Desc },
          },
          fetchPolicy: "network-only",
        });
        if (response.data) {
          const rawLocations =
            response.data.view_page_data_import_history ?? [];
          const uniqueLocations = Array.from(
            new Set(
              rawLocations
                .map((item: any) => item.location_name)
                .filter(Boolean) as string[]
            )
          );
          setAllLocations(
            uniqueLocations.map((loc) => ({ value: loc, label: loc }))
          );
        }
      } catch (error) {
        console.error("Error fetching locations for dropdown:", error);
      }
    };
    fetchAllLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    session?.organizationId,
    session?.userId,
    session?.userRole,
    initialActivityCode,
  ]);

  useEffect(() => {
    if (session?.mappings?.length > 0) {
      const result = session?.mappings?.map((a: any) => {
        return Array.from(new Set(a.activities));
      });
      const uniqueArray = result?.flat()?.filter(function (
        item: any,
        pos: any
      ) {
        return result?.flat()?.indexOf(item) === pos;
      });
      const finalActivitiesArray = CustomHeaderFilter.filter((m) =>
        uniqueArray?.includes(m.section)
      ).map((x) => x);
      setCustomSectionFilterCount(finalActivitiesArray);
    }
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session) {
        return null;
      }
      if (!data.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      let activityFilter: object = {};
      let whereCountFilter: object = {};

      // For organization condition
      // For organization condition
      let where: object = {};
      if (session?.userRole === AppRoles.LocationExecutive) {
        where = {
          organization_id: { _eq: session?.organizationId },
          uploader_user_id: { _eq: session.userId },
        };
      } else if (session?.userRole === AppRoles.OrganizationAdmin) {
        // Organization Admins see all organization uploads
        where = {
          organization_id: { _eq: session?.organizationId },
        };
      } else {
        where = {
          organization_id: { _eq: session?.organizationId },
        };
      }

      activityFilter = where;
      whereCountFilter = where;

      // Apply activity code filter from URL (only in activityFilter, not in counts)
      if (initialActivityCode) {
        activityFilter = {
          _and: {
            ...where,
            activity_code: { _eq: initialActivityCode },
          },
        };
      }

      // Apply location filter if selected
      if (selectedLocation && selectedLocation.length > 0) {
        activityFilter = {
          _and: {
            ...(initialActivityCode ? where : where),
            activity_code: initialActivityCode
              ? { _eq: initialActivityCode }
              : undefined,
            location_name: { _in: selectedLocation },
          },
        };
        whereCountFilter = {
          _and: {
            ...where,
            location_name: { _in: selectedLocation },
          },
        };
      }

      if (columnFilters?.length > 0 || !!globalFilter) {
        let sectionValue = columnFilters.filter((d) => d.id === "section")[0]
          ?.value as string;
        let filenameValue = columnFilters.filter((d) => d.id === "file_name")[0]
          ?.value as string;
        let full_addressValue = columnFilters.filter(
          (d: any) => d.id === "full_address"
        )[0]?.value as string;
        let uploadedbyValue = columnFilters.filter(
          (d) => d.id === "uploadedby"
        )[0]?.value as string;
        let statusValue = columnFilters.filter((d) => d.id === "status")[0]
          ?.value as string;
        let dateValue = columnFilters.filter((d) => d.id === "created_at")[0]
          ?.value as string;
        let FromdateIsostring = dayjs(dateValue).format(
          "YYYY-MM-DDTHH:mm:ss.sssZ"
        );
        let TodateIsostring = dayjs(dateValue)
          .add(1, "day")
          .format("YYYY-MM-DDTHH:mm:ss.sssZ");

        if (dateValue !== "" && FromdateIsostring === "Invalid Date") {
          FromdateIsostring = dayjs("11/01/1819").format(
            "YYYY-MM-DDTHH:mm:ss.sssZ"
          );

          TodateIsostring = dayjs("11/01/1819").format(
            "YYYY-MM-DDTHH:mm:ss.sssZ"
          );
        }
        let isGlobalDateValid = false;
        if (!!globalFilter && globalFilter !== "") {
          isGlobalDateValid = dayjs(globalFilter.trim()).isValid();
        }

        const filtersExceptSection = {
          // For Filename column filter
          ...(!!filenameValue &&
            filenameValue !== "" && {
              file_name: { _ilike: `%${filenameValue.trim()}%` },
            }),
          // For Full address column filter
          ...(!!full_addressValue &&
            full_addressValue !== "" && {
              location_name: { _ilike: `%${full_addressValue.trim()}%` },
            }),
          // For Uploaded by column filter
          ...(!!uploadedbyValue &&
            uploadedbyValue !== "" && {
              uploader_name: { _ilike: `%${uploadedbyValue.trim()}%` },
            }),
          // For Status column filter
          ...(!!statusValue &&
            statusValue !== "" && {
              status: { _ilike: `%${statusValue.trim()}%` },
            }),
          // For Date column filter
          ...(!!dateValue &&
            dateValue !== "" && {
              _and: [
                {
                  created_at: { _gte: `${FromdateIsostring}` },
                },
                {
                  created_at: { _lte: `${TodateIsostring}` },
                },
              ],
            }),
          // For Global search
          ...(!!globalFilter &&
            globalFilter !== "" && {
              _or: [
                {
                  activity_name: { _ilike: `%${globalFilter.trim()}%` },
                },
                {
                  file_name: { _ilike: `%${globalFilter.trim()}%` },
                },
                {
                  location_name: { _ilike: `%${globalFilter.trim()}%` },
                },
                {
                  uploader_name: { _ilike: `%${globalFilter.trim()}%` },
                },
                {
                  status: { _ilike: `%${globalFilter.trim()}%` },
                },
                {
                  _and: [
                    {
                      created_at: {
                        _gte: `${dayjs(
                          isGlobalDateValid ? globalFilter.trim() : "11/01/1819"
                        ).format("YYYY-MM-DDTHH:mm:ss.sssZ")}`,
                      },
                    },
                    {
                      created_at: {
                        _lte: `${dayjs(
                          isGlobalDateValid ? globalFilter.trim() : "11/01/1819"
                        )
                          .add(1, "day")
                          .format("YYYY-MM-DDTHH:mm:ss.sssZ")}`,
                      },
                    },
                  ],
                },
              ],
            }),
        };

        activityFilter = {
          _and: {
            ...where,
            ...filtersExceptSection,
            // Preserve location filter when combined with search/column filters
            ...(selectedLocation.length > 0 && {
              location_name: { _in: selectedLocation },
            }),
            // For Section column filter
            ...(!!sectionValue &&
              sectionValue !== "" && {
                activity_name: { _ilike: `%${sectionValue.trim()}%` },
              }),
            // For Activity Code from URL
            ...(initialActivityCode && {
              activity_code: { _eq: initialActivityCode },
            }),
          },
        };

        whereCountFilter = {
          _and: {
            ...where,
            ...filtersExceptSection,
            // Preserve location filter when combined with search/column filters
            ...(selectedLocation.length > 0 && {
              location_name: { _in: selectedLocation },
            }),
          },
        };
      }

      let orderBy: object = { created_at: "desc" };
      if (sorting?.length > 0) {
        const sort = sorting[0];
        const { desc } = sort;
        orderBy = { [sort.id]: desc === true ? "desc" : "asc" };
        if (sort.id === "section") {
          orderBy = {
            activity_name: desc === true ? "desc" : "asc",
          };
        }

        if (sort.id === "uploadedby") {
          orderBy = { uploader_name: desc === true ? "desc" : "asc" };
        }

        if (sort.id === "full_address") {
          orderBy = {
            location_name: desc === true ? "desc" : "asc",
          };
        }
      }
      try {
        await fetchDataImportHistoryList({
          variables: {
            where: activityFilter,
            start: parseInt(`${pagination.pageIndex * pagination.pageSize}`),
            size: parseInt(`${pagination.pageSize}`),
            orderBy: orderBy,
          },
        }).then(async (response) => {
          if (!!response.data) {
            const dataImportHistoryData: any = [];
            response?.data?.view_page_data_import_history?.map(
              (dbDetail: any) => {
                dataImportHistoryData.push({
                  section: dbDetail?.activity_name,
                  file_name: dbDetail?.file_name,
                  full_address: dbDetail?.location_name,
                  created_at: dayjs(dbDetail?.created_at).format("DD MMM YYYY"),
                  uploadedby: dbDetail?.uploader_name,
                  status:
                    dbDetail?.status === DataImportHistoryStatus.Failure
                      ? "File Error"
                      : "Uploaded",
                  file_log_url: dbDetail?.status_file_url,
                  file_url: dbDetail?.file_url,
                });
              }
            );
            setData(dataImportHistoryData);

            // allLocations is populated by a dedicated effect below (not from paginated data)

            // Calculate filtered row count from aggregate query for pagination
            const filteredTotalCount =
              response?.data?.view_page_data_import_history_aggregate?.aggregate
                ?.count ?? 0;
            setRowCount(filteredTotalCount);

            // Fetch total activity counts using the base org/user filter
            const countsResponse = await fetchDataImportHistoryCounts({
              variables: {
                where: whereCountFilter as any,
              },
            });

            // Calculate total count (sum of all 'count' values) for the "All" tab
            const nodes =
              countsResponse?.data?.view_page_data_import_history_aggregate
                ?.nodes ?? [];
            const totalDataCount = nodes.length;
            setAllFilterCount(totalDataCount);

            // Update individual activity counts by summing records for each code
            setCustomSectionFilterCount((prevItems: any) =>
              prevItems.map((item: any) => {
                const activityCount = nodes.filter(
                  (node: any) => node.activity_code === item.activity_code
                ).length;

                return {
                  ...item,
                  count: activityCount,
                };
              })
            );
          }
        });
      } catch (error) {
        setIsError(true);
        console.error(error);
        return;
      }
      setIsError(false);
      setIsLoading(false);
      setIsRefetching(false);
    };
    fetchData();

    window.addEventListener("message", (event) => {
      event.preventDefault();
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          let messageData = JSON.parse(event.data);
          const type = messageData.type;

          if (type === "bulk-page-refresh") {
            fetchData();
          }
        } catch {
          return false;
        }
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    columnFilters, //refetch when column filters change
    globalFilter, //refetch when global filter changes
    pagination.pageIndex, //refetch when page index changes
    pagination.pageSize, //refetch when page size changes
    sorting, //refetch when sorting changes
    isBulkImported,
    session, // Refetch when session changes
    selectedLocation, // Refetch when location filter changes
    initialActivityCode, // Refetch when activity code changes
  ]);
  const [isFocused, setIsFocused] = useState(false);

  const {
    handleExportData,
    handleDownloadTemplate,
    handleBulkUploadClick,
    handleAiBulkUploadClick,
    isDownloadingTemplate,
  } = useDataImportHistoryToolbarActions({
    session,
    initialActivityCode,
    selectedLocation,
  });

  const columns = useMemo<MRT_ColumnDef<TBulkImport>[]>(
    () => [
      {
        accessorKey: "section",
        header: "section",
      },
      {
        accessorKey: "file_name",
        header: "file name",
        size: 150,
        Cell: ({ cell, row }) => (
          <Tooltip
            withArrow
            position="bottom-start"
            arrowOffset={13}
            arrowSize={10}
            label={cell.getValue<string>()}
          >
            <Box
              style={(theme) => ({
                color:
                  row.original.status.toLowerCase() ===
                  DataImportHistoryStatus.Uploaded.toLowerCase()
                    ? "#666666"
                    : "#ff8080",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              })}
            >
              {cell.getValue<string>()}
            </Box>
          </Tooltip>
        ),
      },
      {
        accessorKey: "full_address",
        header: "location covered",
        size: 100,
      },
      {
        accessorKey: "created_at",
        header: "date",
        size: 100,
      },
      {
        accessorKey: "uploadedby",
        header: "uploaded by",
        size: 120,
      },
      // {
      //   accessorKey: "import_method",
      //   header: "Import Method",
      //   size: 110,
      // },
      {
        accessorKey: "status",
        header: "status",
        size: 80,
        Cell: ({ cell }) => (
          <Box
            ff="Euclid Circular B"
            style={(theme) => ({
              backgroundColor:
                cell.getValue<string>().toLowerCase() ===
                DataImportHistoryStatus.Uploaded.toLowerCase()
                  ? theme.colors.success[0]
                  : theme.colors.failure[0],
              borderRadius: "20px",
              color: "#000",
              fontFamily: "'Euclid Circular B",
              width: "max-content",
              padding: "3px 8px",
              display: "flex",
              alignItems: "center",
              fontSize: "10px",
              fontStyle: "normal",
              fontWeight: 400,
              lineHeight: "normal",
            })}
          >
            {cell.getValue<string>()}
          </Box>
        ),
      },
    ],
    []
  );

  const table = useMantineReactTable({
    mantineTopToolbarProps: {
      m: "0 30px",
    },
    renderTopToolbar: () => (
      <DataImportHistoryToolbar<TBulkImport>
        table={table}
        allLocations={allLocations}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        onBulkUpload={handleBulkUploadClick}
        onDownloadTemplate={handleDownloadTemplate}
        onAiUpload={handleAiBulkUploadClick}
        onExport={handleExportData}
        initialActivityCode={initialActivityCode}
        isAIEnabled={false}
        disableUploadDownload={disableUploadDownload}
      />
    ),
    icons: faIcons,
    columns,
    data,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableRowSelection: false,
    initialState: { showColumnFilters: true, showGlobalFilter: true },
    columnFilterDisplayMode: "popover",
    manualFiltering: true,
    manualPagination: true,
    enableFilterMatchHighlighting: false,
    enableColumnFilters: false,
    paginationDisplayMode: "pages",
    mantinePaperProps: { className: classes.tableStyling },
    mantinePaginationProps: {
      withEdges: false, //note: changed from `showFirstLastButtons` in v1.0
    },
    mantineTableContainerProps: {
      style: {
        marginLeft: "30px",
        marginRight: "30px",
        borderRadius: "10px",
        boxShadow:
          "rgba(159, 162, 191, 0.18) 0px 9px 16px, rgba(159, 162, 191, 0.32) 0px 2px 2px",
        // minHeight: 480,
      },
    },
    mantineTableProps: {
      highlightOnHover: true,
      style: {
        "--table-highlight-on-hover-color": "#F1F3F6 !important",
      },
    },
    renderEmptyRowsFallback: () => (
      <Flex justify="center" align="center" py="2rem" w="100%">
        <Text fz={16} c="#868e96" fs="italic">
          No data available
        </Text>
      </Flex>
    ),
    localization: {
      rowsPerPage: "Items per page:", // Change "Rows per page" to "Items per page"
      sortByColumnAsc: "Sort by {column} ascending",
      sortByColumnDesc: "Sort by {column} descending",
      noRecordsToDisplay: "No data available",
    },
    mantineTableHeadCellProps: ({ column }) => ({
      style: column.getCanSort() ? { cursor: "pointer" } : {},
    }),
    mantineSearchTextInputProps: {
      placeholder: "Search...",
      className: isFocused
        ? "search-custmize-focused search-custmize-div"
        : "search-custmize-div",
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
      // className: classes.searchInputClass,
      styles: {
        wrapper: { width: 251 },
        input: {
          border: isFocused ? "1px solid #005C81" : "",
          color: "#666" + "!important",
          opacity: 1,
          // marginLeft: "5px",
          borderRadius: 20,
          paddingLeft: 40,
          "&::placeholder": {
            color: "#223354" + "!important",
          },
        },
      },
      leftSection: <SearchIcon color={isFocused ? "#005C81" : "#666666"} />,
    },
    mantineProgressProps: ({ isTopToolbar }) => ({
      color: "#72D0C6",
      style: { display: isTopToolbar ? "block" : "none" }, //only show top toolbar progress bar
      value: 100, //show precise real progress value if you so desire
    }),
    manualSorting: true,
    rowCount,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
      showGlobalFilter,
    },
    mantineToolbarAlertBannerProps: isError
      ? { color: "red", children: "Error loading data" }
      : undefined,
    enableRowNumbers: true,
    displayColumnDefOptions: {
      "mrt-row-numbers": { Header: "SN" },
      "mrt-row-actions": { size: 50, Header: "Action" },
    },
    enableRowActions: true,
    positionActionsColumn: "last",
    renderRowActions: ({ row }) =>
      row.original.status.toLowerCase() ===
      DataImportHistoryStatus.Uploaded.toLowerCase() ? (
        <ActionIcon
          variant="subtle"
          //onClick={() => window.open(row?.original?.file_name)}
          onClick={() =>
            handleDownload(row?.original?.file_url, row.original?.file_name)
          }
          className="ActionButton"
        >
          <DownloadIcon className="svgIcon" />
        </ActionIcon>
      ) : (
        <Flex gap={12} justify="flex-start" align="center" direction="row">
          <ActionIcon
            variant="subtle"
            onClick={() => window.open(row?.original?.file_log_url)}
            className="ActionButton"
          >
            <ExclamationIcon className="svgIcon" />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            // onClick={() => window.open(row?.original?.file_url)}
            onClick={() =>
              handleDownload(row?.original?.file_url, row.original?.file_name)
            }
            style={{ marginTop: "-3px" }}
            className="ActionButton"
          >
            <DownloadIcon className="svgIcon" />
          </ActionIcon>
        </Flex>
      ),
    renderBottomToolbar: ({ table }) => {
      const startRow = pagination.pageIndex * pagination.pageSize + 1;
      const endRow = Math.min(
        rowCount,
        (pagination.pageIndex + 1) * pagination.pageSize
      );

      return (
        <Flex gap="sm" align={"center"} mx={30} pb={60}>
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
  });
  const changeTab = (element: string) => {
    let customFilter: TCustomFilter[] = [];
    if (element !== "All") {
      customFilter.push({ id: "section", value: element });
      setColumnFilters(customFilter);
    } else {
      setColumnFilters(customFilter);
    }
    setcustomFilterValue(element);
  };
  const theme = createTheme({
    components: {
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
            textTransform: "capitalize",
          },
          td: {
            color: "#666",
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
      ActionIcon: {
        styles: {
          root: {
            color: "#003b52",
            backgroundColor: "transparent",
            "&[data-disabled]": {
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: "transparent",
              },
            },
          },
        },
      },
      Tooltip: {
        defaultProps: {
          position: "bottom",
        },
      },
    },
  });

  const handleDownload = async (fileUrl: string, filename: string) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Failed to fetch file");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error in downloading the file:", err);
    }
  };

  return (
    <Stack gap={10} className="themeTable">
      <MantineProvider theme={theme}>
        <MantineReactTable table={table} />
      </MantineProvider>
    </Stack>
  );
};
export default DataImportHistoryTable;
