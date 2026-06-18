import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { faSortDown, faSortUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Badge,
  Box,
  Card,
  createTheme,
  Flex,
  MantineProvider,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  MantineReactTable,
  MRT_TablePagination,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_Icons,
  type MRT_PaginationState,
  type MRT_SortingState,
} from "mantine-react-table";
import { useParams } from "next/navigation";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { auditLogFileUpload } from "~/app/actions/auditlog";
import { useUpdateAiFileUploadsMutation } from "~/graphql/mutations/update-ai-uploads-status.generated";
import { useGetUploadedFilesQuery } from "~/graphql/queries/get-ai-files-uploads.generated";
import { useGetOrganizationAddressAndActivityMappingQuery } from "~/graphql/queries/get-organization-address-and-activity-mapping.generated";
import { ACTIVITY_CODES } from "~/lib/shared/constants/dataimporthistory.constant";
import {
  AIFileUploadStatus,
  AIFileUploadStatusTooltip,
} from "~/shared/constants/ai-constant";
import { viewVerifyExtractedData } from "~/shared/services/platform-window-message-service";
import {
  AIFileUpload,
  SectionFilter,
  TCustomFilter,
} from "~/shared/types/ai-types";
import { formatDateDisplay, handleDownload } from "~/utils/common-functions";
import {
  getOrganizationIdFromToken,
  getUserIdFromToken,
  getUserRoleFromToken,
  isAIEnable,
  ROLE_LOCATION_EXECUTIVE,
  ROLE_ORGANIZATION_ADMIN,
} from "~/utils/jwt/getUserDataFromToken";
import EditIcon from "../icons/EditIcon";
import EyeIcon from "../icons/EyeIcon";
import PendingVerificationIcon from "../icons/PendingVerificationIcon";
import SearchIcon from "../icons/SearchIcon";
import DownloadIcon from "../icons/TableDownloadIcon";
import ExclamationIcon from "../icons/TableExclamationIcon";
import TrashIcon from "../icons/TrashIcon";
import classes from "./CSS.module.css";
import { DataImportHistoryToolbar } from "./DataImportHistoryToolbar";
import { useDataImportHistoryToolbarActions } from "./useDataImportHistoryToolbarActions";
config.autoAddCss = false;
type Status = (typeof AIFileUploadStatus)[keyof typeof AIFileUploadStatus];

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

// Helper component for conditional tooltip
type MaybeTooltipActionIconProps = {
  tooltip: string;
  disabled: boolean;
  children: ReactNode;
  [key: string]: any;
};
const MaybeTooltipActionIcon = ({
  tooltip,
  disabled,
  children,
  ...actionIconProps
}: MaybeTooltipActionIconProps) => {
  const customButtonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "transparent",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "opacity 0.2s ease",
    padding: 0,
    ...actionIconProps.style,
  };

  const buttonElement = (
    <button
      {...actionIconProps}
      disabled={disabled}
      style={customButtonStyle}
      type="button"
    >
      {children}
    </button>
  );

  return disabled ? (
    buttonElement
  ) : (
    <Tooltip
      offset={5}
      position="bottom-start"
      label={tooltip}
      multiline
      withinPortal
    >
      {buttonElement}
    </Tooltip>
  );
};

const AIDataImportHistoryTable: React.FC = () => {
  const postParentMessage = (message: string) =>
    window.parent?.postMessage(message, "*");
  const params = useParams();
  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [customFilterValue, setCustomFilterValue] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState<string[]>([]);
  const [allLocations, setAllLocations] = useState<
    Array<{ value: string; label: string }>
  >([]);
  // Tracks whether the one-time auto-select-all on first data load has fired.
  // Once true, user-driven deselects (including "uncheck all") are preserved.
  const hasPreSelectedRef = useRef(false);
  const [assignedLocationNames, setAssignedLocationNames] = useState<string[]>(
    []
  );
  const [showNoPendingVerificationNote, setShowNoPendingVerificationNote] =
    useState(false);
  const [showProcessingUploadingNote, setShowProcessingUploadingNote] =
    useState(false);
  const [allResultCount, setAllResultCount] = useState(0);
  const userRole = getUserRoleFromToken(
    params?.accessToken as string | string[] | undefined
  );
  const organizationId = getOrganizationIdFromToken(
    params?.accessToken as string | string[] | undefined
  );
  const isAdmin =
    Array.isArray(userRole) && userRole.includes(ROLE_ORGANIZATION_ADMIN);
  const isLocationExecutive =
    Array.isArray(userRole) && userRole.includes(ROLE_LOCATION_EXECUTIVE);
  const userId = getUserIdFromToken(
    params?.accessToken as string | string[] | undefined
  );

  // Activity code is null for AI table (shows all activities)
  const initialActivityCode = ACTIVITY_CODES.ENERGY_GRID_POWER;
  const isAIEnabled = isAIEnable(params?.accessToken as string | string[]);

  // Create session object for toolbar actions hook
  const session = {
    organizationId,
    userId,
    userRole: userRole?.[0] || null,
  };

  // Use toolbar actions hook
  const {
    handleExportData,
    handleDownloadTemplate,
    handleBulkUploadClick,
    handleAiBulkUploadClick,
  } = useDataImportHistoryToolbarActions({
    session,
    initialActivityCode,
    selectedLocation,
  });

  const [updateAiFileUPloadsMutation] = useUpdateAiFileUploadsMutation();
  const getOrgAddressMapping = useGetOrganizationAddressAndActivityMappingQuery(
    {
      skip: true,
    }
  );

  //Fetch organization address for User and Location Mapping
  useEffect(() => {
    async function fetchOrgAddresses() {
      if (!userId) return;

      const locationsByOrganization = await getOrgAddressMapping.refetch({
        userId,
      });
      const userAccessLocationNames =
        locationsByOrganization?.data?.UserOrganizationAddressMapping?.map(
          (mapping) => mapping.OrganizationAddress?.Address?.name
        ).filter(Boolean) || [];
      setAssignedLocationNames(userAccessLocationNames as string[]);
    }
    fetchOrgAddresses();
  }, [getOrgAddressMapping, userId]);

  // Build GraphQL variables from table state
  const buildVariables = () => {
    // Global search filters
    const orFilters = [];

    if (globalFilter) {
      orFilters.push({ file_name: { _ilike: `%${globalFilter}%` } });
      orFilters.push({ activity_code: { _ilike: `%${globalFilter}%` } });
      orFilters.push({ status: { _ilike: `%${globalFilter}%` } });
      orFilters.push({ location_names: { _ilike: `%${globalFilter}%` } });
      orFilters.push({ verified_by_name: { _ilike: `%${globalFilter}%` } });
      orFilters.push({ uploaded_by_name: { _ilike: `%${globalFilter}%` } });
    }
    // ---- Note: Kept type any for where, to support dynamic filters
    let where: any = {};
    let fileProcessingWhere: any = {};
    let pendingEmailSendWhere: any = {};
    let allResultWhere: any = {};
    const locationFilterCondition =
      selectedLocation && selectedLocation.length > 0
        ? [
            {
              _or: selectedLocation.map((loc) => ({
                location_names: { _ilike: `%${loc}%` },
              })),
            },
          ]
        : [];

    if (isAdmin) {
      // Admin: Only show verified and not deleted files
      where = {
        _and: [
          ...(orFilters.length > 0 ? [{ _or: orFilters }] : []),
          ...locationFilterCondition,
          { status: { _eq: AIFileUploadStatus.Verified } },
          { organization_id: { _eq: organizationId } },
          { is_deleted: { _eq: false } },
        ],
      };
    } else if (isLocationExecutive) {
      // Executive: Created by user OR Verified files under assigned locations
      const locationOrFilter = assignedLocationNames.map((name) => ({
        location_names: { _ilike: `%${name}%` },
      }));

      // for page wise filter
      where = {
        _or: [
          {
            _and: [
              ...(orFilters.length > 0 ? [{ _or: orFilters }] : []),
              ...locationFilterCondition,
              { created_by: { _eq: userId } },
              { is_deleted: { _eq: false } },
            ],
          },
          {
            _and: [
              ...(orFilters.length > 0 ? [{ _or: orFilters }] : []),
              ...locationFilterCondition,
              { status: { _eq: AIFileUploadStatus.Verified } },
              { is_deleted: { _eq: false } },
              { _or: locationOrFilter },
            ],
          },
        ],
      };

      // get file count to show no file processing note.
      // Only show the no pending note if any record are Pending,Uploading,Uploaded,Processing,VerificationPending
      fileProcessingWhere = {
        _and: [
          ...locationFilterCondition,
          { created_by: { _eq: userId } },
          { is_deleted: { _eq: false } },
          {
            status: {
              _in: [
                AIFileUploadStatus.Pending,
                AIFileUploadStatus.Uploading,
                AIFileUploadStatus.Uploaded,
                AIFileUploadStatus.Processing,
                AIFileUploadStatus.VerificationPending,
              ],
            },
          },
        ],
      };

      // get file count to show send email note.
      // show email will be sent note if any record is Pending, Uploading,Uploaded or Processing status
      pendingEmailSendWhere = {
        _and: [
          ...locationFilterCondition,
          { created_by: { _eq: userId } },
          { is_deleted: { _eq: false } },
          {
            status: {
              _in: [
                AIFileUploadStatus.Pending,
                AIFileUploadStatus.Uploading,
                AIFileUploadStatus.Uploaded,
                AIFileUploadStatus.Processing,
              ],
            },
          },
        ],
      };

      // Get the total number of items accessible to the current user.
      allResultWhere = {
        _or: [
          {
            _and: [
              ...locationFilterCondition,
              { created_by: { _eq: userId } },
              { is_deleted: { _eq: false } },
            ],
          },
          {
            _and: [
              ...locationFilterCondition,
              { status: { _eq: AIFileUploadStatus.Verified } },
              { is_deleted: { _eq: false } },
              { _or: locationOrFilter },
            ],
          },
        ],
      };
    } else {
      // Fallback: Just prevent deleted entries
      where = {
        _and: [
          ...(orFilters.length > 0 ? [{ _or: orFilters }] : []),
          ...locationFilterCondition,
          { is_deleted: { _eq: false } },
        ],
      };
    }

    // Sorting
    let order_by: any[] = [{ created_at: "desc" }];

    if (sorting.length > 0) {
      const sort = sorting[0];
      if (sort.id === "location_covered") {
        order_by = [
          { location_names: sort.desc ? "desc_nulls_last" : "asc_nulls_last" },
        ];
      } else if (sort.id === "verified_at") {
        order_by = [
          { verified_at: sort.desc ? "desc_nulls_last" : "asc_nulls_last" },
        ];
      } else if (sort.id === "verified_by") {
        order_by = [
          {
            verified_by_name: sort.desc ? "desc_nulls_last" : "asc_nulls_last",
          },
        ];
      } else if (sort.id === "updated_by") {
        order_by = [
          {
            uploaded_by_name: sort.desc ? "desc_nulls_last" : "asc_nulls_last",
          },
        ];
      } else {
        order_by = [{ [sort.id]: sort.desc ? "desc" : "asc" }];
      }
    }

    return {
      where,
      limit: pagination.pageSize,
      offset: pagination.pageIndex * pagination.pageSize,
      order_by,
      fileProcessingWhere,
      pendingEmailSendWhere,
      allResultWhere,
    };
  };

  const variables = useMemo(buildVariables, [
    globalFilter,
    userRole,
    sorting,
    pagination.pageSize,
    pagination.pageIndex,
    selectedLocation,
    assignedLocationNames,
    userId,
  ]);

  const { data, loading, refetch } = useGetUploadedFilesQuery({
    variables,
    fetchPolicy: "network-only", //always fetch fresh data from the server, bypassing any cached data. This ensures the UI always displays the most up-to-date records
  });

  // Refetch table data every 5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  //VC: Commented out the processing and uploading files query as it is not used in the current implementation
  // const { data: processingUploadingData } =
  //   useGetProcessingAndUploadingFilesWithCountQuery();

  const transformedData = useMemo(() => {
    if (!data?.AIFileUploadListingView) return [];
    return data.AIFileUploadListingView.map((upload: any) => {
      return {
        id: upload.file_id,
        activity_code: upload.activity_code,
        file_name: upload.file_name || "",
        created_at: upload.created_at || "",
        file_url: upload.file_url || "",
        status: upload.status || "",
        errors: upload.errors,
        updated_by: upload.uploaded_by_name || "",
        verified_at: upload.verified_at || "-",
        verified_by: upload.verified_by_name || "-",
        location_covered: upload.location_names || "-",
      };
    });
  }, [data?.AIFileUploadListingView]);

  useEffect(() => {
    if (!data?.AIFileUploadListingView?.length) return;

    const uniqueLocations = Array.from(
      new Set(
        data.AIFileUploadListingView.flatMap((item: any) => {
          const locationNames = item?.location_names;
          if (!locationNames || typeof locationNames !== "string") return [];
          return locationNames
            .split(",")
            .map((name) => name.trim())
            .filter(Boolean);
        })
      )
    );

    const mapped = uniqueLocations.map((location) => ({
      value: location,
      label: location,
    }));
    setAllLocations(mapped);
    // Pre-select all locations only on the very first data load.
    // After that, user-driven deselects (including "uncheck all") are preserved.
    if (!hasPreSelectedRef.current) {
      hasPreSelectedRef.current = true;
      setSelectedLocation(mapped.map((l) => l.value));
    }
  }, [data?.AIFileUploadListingView]);

  const totalCount =
    data?.AIFileUploadListingView_aggregate?.aggregate?.count ?? 0;

  // Always update rowCount and pagination after delete/refetch ---
  useEffect(() => {
    // If the current page is empty after a delete, go to previous page
    if (
      data?.AIFileUploadListingView &&
      data.AIFileUploadListingView.length === 0 &&
      pagination.pageIndex > 0
    ) {
      setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex - 1 }));
    }
  }, [data?.AIFileUploadListingView, pagination.pageIndex]); // After delete, just refetch (let effect above handle pagination/rowCount)

  useEffect(() => {
    const fileProcessingCount =
      data?.AIFileUploadListingView_FileProcessingCount?.aggregate?.count;
    // to disable flicker at load due to undefined
    if (typeof fileProcessingCount === "number") {
      setShowNoPendingVerificationNote(fileProcessingCount === 0);
    }

    const pendingEmailSendCount =
      data?.AIFileUploadListingView_PendingEmailSendCount?.aggregate?.count;
    // to disable flicker at load due to undefined
    if (typeof pendingEmailSendCount === "number") {
      setShowProcessingUploadingNote(pendingEmailSendCount > 0);
    }

    const totalCount =
      data?.AIFileUploadListingView_AllResultCount?.aggregate?.count;
    if (typeof totalCount === "number") {
      setAllResultCount(totalCount);
    }
  }, [data?.AIFileUploadListingView]);

  const handleDelete = React.useCallback(
    async (fileId: string) => {
      try {
        setIsRefetching(true);
        const deletedFiles = await updateAiFileUPloadsMutation({
          variables: {
            where: { id: { _eq: fileId } },
            set: {
              is_deleted: true,
              updated_at: new Date().toISOString(),
            },
          },
        });
        await refetch();
        auditLogFileUpload({
          data: [],
          userId: userId || "",
          deletedData: deletedFiles.data?.update_AIFileUploads?.returning || [],
        });
      } catch (error) {
        setIsError(true);
        console.error("Error deleting file:", error);
      } finally {
        setIsRefetching(false);
      }
    },
    [refetch, updateAiFileUPloadsMutation]
  );

  // Listen for confirm-file-delete message and trigger handleDelete
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      let messageData: { type: string; fileId: string } = {
        type: "",
        fileId: "",
      };
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          const fileId = String(messageData.fileId);
          if (type === "confirm-file-delete" && fileId) {
            await handleDelete(fileId);
          }
          if (type === "ai-upload-pop-up-closed") {
            refetch();
          }
        } catch (error) {
          // Ignore parse errors
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [handleDelete]);

  // Function to return a color based on the status
  const getStatusColor = (status: Status): string => {
    switch (status) {
      case "Processing":
        return "#FFC675";
      case "VerificationPending":
        return "#D9D9D9";
      case "Verified":
        return "#03F4AC";
      case "UploadError":
      case "ProcessingError":
        return "#FF8080";
      case "Uploading":
        return "#E1F6FF";
      default:
        return "#FFC675";
    }
  };

  const columns = useMemo<MRT_ColumnDef<AIFileUpload>[]>(
    () => [
      {
        accessorKey: "activity_code",
        header: "section",
        size: 10,
        Cell: ({ cell }) =>
          cell.getValue<string>() === "energy_grid_power"
            ? "Energy-Grid"
            : cell.getValue<string>(),
      },
      {
        accessorKey: "file_name",
        header: "file name",
        size: 150,
        Cell: ({ row, cell }) => {
          const { status, errors } = row.original;
          const isError =
            status === AIFileUploadStatus.UploadError ||
            status === AIFileUploadStatus.ProcessingError;

          const errorMessage = isError
            ? (() => {
                try {
                  let parsedErrors: any = {};
                  if (typeof errors === "object" && errors !== null) {
                    parsedErrors = errors;
                  } else if (typeof errors === "string") {
                    const trimmedErrors = errors.trim();
                    parsedErrors = trimmedErrors
                      ? JSON.parse(trimmedErrors)
                      : {};
                  }
                  return status === AIFileUploadStatus.UploadError
                    ? parsedErrors?.uploadError?.userMessage
                    : parsedErrors?.processingError?.userMessage;
                } catch (e) {
                  console.error("Error parsing error message:", e);
                  return errors && typeof errors === "string"
                    ? errors
                    : "Error parsing error message";
                }
              })()
            : null;

          return (
            <Flex gap={4}>
              <Tooltip
                offset={5}
                position="bottom-start"
                label={cell.getValue<string>()}
                multiline
                withinPortal
                tt="capitalize"
              >
                <Text fz={12} c={isError ? "#FA0B0B" : "#666"} truncate>
                  {cell.getValue<string>()}
                </Text>
              </Tooltip>
              {isError && (
                <Tooltip
                  offset={5}
                  position="bottom-start"
                  label={errorMessage || "Unknown error"}
                >
                  <Box>
                    <ExclamationIcon
                      size={16}
                      color="#FA0B0B"
                      hoverColor="#FA0B0B"
                    />
                  </Box>
                </Tooltip>
              )}
            </Flex>
          );
        },
      },
      {
        accessorKey: "location_covered",
        header: "location",
        size: 10,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          const shouldShowTooltip = value && value !== "-";
          return shouldShowTooltip ? (
            <Tooltip
              offset={5}
              position="bottom-start"
              label={value}
              multiline
              withinPortal
              tt="capitalize"
            >
              <Text c="#666" fz={12} truncate>
                {value}
              </Text>
            </Tooltip>
          ) : (
            <Text c="#666" fz={12} truncate>
              {value || "-"}
            </Text>
          );
        },
        enableSorting: true, // Now enabled since we can sort directly on view column
        enableColumnFilter: false,
      },
      {
        accessorKey: "created_at",
        header: "upload date",
        Cell: ({ cell }) => {
          const dateValue = cell.getValue<string>();
          return formatDateDisplay(dateValue);
        },
        size: 10,
      },
      {
        accessorKey: "updated_by",
        header: "uploaded by",
        size: 10,
        Cell: ({ cell }) => {
          return (
            <Tooltip
              offset={5}
              position="bottom-start"
              label={cell.getValue<string>()}
              multiline
              withinPortal
              tt="capitalize"
            >
              <Text c="#666" fz={12} truncate>
                {cell.getValue<string>()}
              </Text>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "verified_at",
        header: "verified on",
        enableSorting: true,
        enableColumnFilter: true,
        size: 10,
        Cell: ({ cell, row }) => {
          const { status } = row.original;
          const verifiedAt = cell.getValue<string>();
          if (
            status !== AIFileUploadStatus.Verified ||
            !verifiedAt ||
            verifiedAt === "-"
          )
            return "-";
          return formatDateDisplay(verifiedAt);
        },
      },
      {
        accessorKey: "verified_by",
        header: "verified by",
        enableSorting: true,
        enableColumnFilter: true,
        size: 100,
        Cell: ({ cell }) => {
          const value = cell.getValue<string>();
          const shouldShowTooltip = value && value !== "-";
          return shouldShowTooltip ? (
            <Tooltip
              offset={5}
              position="bottom-start"
              label={value}
              multiline
              withinPortal
              tt="capitalize"
            >
              <Text c="#666" fz={12} truncate>
                {value}
              </Text>
            </Tooltip>
          ) : (
            <Text c="#666" fz={12} truncate>
              {value || "-"}
            </Text>
          );
        },
      },
      {
        accessorKey: "status",
        header: "status",
        size: 160,
        mantineTableHeadCellProps: {
          className: "aiStatusColumnHeader",
        },
        mantineTableBodyCellProps: {
          style: { textAlign: "left" },
        },
        Cell: ({ cell }) => {
          const rawStatus = cell.getValue() as Status;
          const color = getStatusColor(rawStatus);

          const formatted =
            rawStatus === AIFileUploadStatus.VerificationPending
              ? "Pending Verification"
              : rawStatus === AIFileUploadStatus.UploadError ||
                  rawStatus === AIFileUploadStatus.ProcessingError
                ? "Failed"
                : rawStatus.replace(/([A-Z])/g, " $1").trim();

          return (
            <Flex justify={"flex-start"}>
              <Tooltip
                offset={5}
                position="bottom"
                label={
                  AIFileUploadStatusTooltip[
                    rawStatus as keyof typeof AIFileUploadStatusTooltip
                  ] || formatted
                }
                multiline
                withinPortal
              >
                <Badge
                  color={color}
                  fz={10}
                  c="#444444"
                  fw={400}
                  tt="capitalize"
                >
                  {formatted}
                </Badge>
              </Tooltip>
            </Flex>
          );
        },
      },
    ],
    []
  ); // Show loader while fetching data
  const isTableLoading = loading || isLoading || isRefetching;
  const table = useMantineReactTable({
    mantineBottomToolbarProps: {
      m: -18,
    },
    icons: faIcons,
    columns,
    data: isTableLoading ? [] : transformedData,
    enableColumnActions: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableRowSelection: false,
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
    },
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
    mantineTopToolbarProps: {
      m: "0 30px",
    },
    mantineTableProps: {
      highlightOnHover: true,
      style: {
        "--table-highlight-on-hover-color": "#F1F3F6 !important",
      },
    },
    mantineTableBodyRowProps: {
      style: {
        "&:hover": {
          backgroundColor: "#F1F3F6 !important",
        },
      },
    },
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
      leftSection: <SearchIcon color={isFocused ? "#005C81" : "#666666"} />,
      styles: {
        input: {
          border: isFocused ? "1px solid #005C81" : "",
          color: "#666" + "!important",
          opacity: 1,
        },
      },
    },
    mantineProgressProps: ({ isTopToolbar }) => ({
      color: "#72D0C6",
      style: { display: isTopToolbar ? "block" : "none" },
      value: 100,
    }),
    manualSorting: true,
    rowCount: totalCount,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      globalFilter,
      isLoading: isTableLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
    mantineToolbarAlertBannerProps: isError
      ? { color: "red", children: "Error loading data" }
      : undefined,
    enableRowNumbers: true,
    displayColumnDefOptions: {
      "mrt-row-numbers": { Header: "SN" },
      "mrt-row-actions": { size: 20, Header: "Action" },
    },
    enableRowActions: true,
    positionActionsColumn: "last",
    renderRowActions: ({ row }) => {
      const status = row.original.status;
      // Status flags
      const isVerified = status === AIFileUploadStatus.Verified;
      const isProcessing = status === AIFileUploadStatus.Processing;
      const isPendingVerification =
        status === AIFileUploadStatus.VerificationPending;
      const isProcessingFailed = status === AIFileUploadStatus.ProcessingError;
      const isUploadingFailed = status === AIFileUploadStatus.UploadError;

      // Icon style helpers
      const commonIconStyle = { marginTop: "-3px" };
      const disabledStyle = { opacity: 0.5 };
      const getStyle = (disabled: boolean) => ({
        ...commonIconStyle,
        ...(disabled ? disabledStyle : {}),
      });
      const getIconClass = (disabled: boolean) =>
        disabled ? undefined : "svgIcon";

      // --- LOCATION EXECUTIVE LOGIC ---
      if (isLocationExecutive) {
        // Verify: Always visible, enabled only for Pending Verification
        const verifyDisabled = !isPendingVerification;
        // Download: Always visible, enabled for Processing, Failed, Pending Verification, Verified; disabled otherwise
        const downloadDisabled = !(
          isPendingVerification ||
          isVerified ||
          isProcessing ||
          isProcessingFailed
        );
        // Delete: Always visible, enabled for Pending Verification; disabled otherwise
        const deleteDisabled = !(
          isPendingVerification ||
          isUploadingFailed ||
          isProcessingFailed
        );

        return (
          <Flex gap={10} justify="flex-start" align="center" direction="row">
            {isVerified && (
              <MaybeTooltipActionIcon
                tooltip="Edit"
                disabled={false}
                variant="subtle"
                className="ActionButton"
                style={getStyle(false)}
                onClick={() => {
                  postParentMessage(
                    viewVerifyExtractedData({
                      fileId: row.original.id,
                      isEdit: true,
                    })
                  );
                }}
              >
                <EditIcon className={getIconClass(false)} />
              </MaybeTooltipActionIcon>
            )}
            {!isVerified && (
              <MaybeTooltipActionIcon
                tooltip="Verify"
                disabled={verifyDisabled}
                variant="subtle"
                className="ActionButton"
                style={getStyle(verifyDisabled)}
                onClick={() => {
                  postParentMessage(
                    viewVerifyExtractedData({
                      fileId: row.original.id,
                      isEdit: false,
                    })
                  );
                }}
              >
                <PendingVerificationIcon
                  size={23}
                  className={getIconClass(verifyDisabled)}
                />
              </MaybeTooltipActionIcon>
            )}
            <MaybeTooltipActionIcon
              tooltip="Download"
              disabled={downloadDisabled}
              variant="subtle"
              onClick={() =>
                !downloadDisabled &&
                handleDownload(row?.original?.file_url, row.original?.file_name)
              }
              className="ActionButton"
              style={getStyle(downloadDisabled)}
            >
              <DownloadIcon className={getIconClass(downloadDisabled)} />
            </MaybeTooltipActionIcon>
            <MaybeTooltipActionIcon
              tooltip="Delete"
              disabled={deleteDisabled}
              variant="subtle"
              className="ActionButton"
              style={getStyle(deleteDisabled)}
              onClick={() => {
                if (!deleteDisabled) {
                  const message = {
                    type: "DeleteUploadHistoryRow",
                    fileId: row.original.id,
                    fileName: row.original.file_name,
                  };
                  window.parent.postMessage(JSON.stringify(message), "*");
                }
              }}
            >
              <TrashIcon className={getIconClass(deleteDisabled)} />
            </MaybeTooltipActionIcon>
          </Flex>
        );
      }

      if (isAdmin) {
        // View (Verify icon): visible for Verified
        const viewDisabled = !isVerified;
        // Download: always visible, enabled for Processing, Failed, Pending Verification, Verified; disabled otherwise
        const downloadDisabled = !(
          isProcessing ||
          isProcessingFailed ||
          isPendingVerification ||
          isVerified
        );

        return (
          <Flex gap={12} justify="flex-start" align="center" direction="row">
            <MaybeTooltipActionIcon
              tooltip="View"
              disabled={viewDisabled}
              variant="subtle"
              className="ActionButton"
              style={getStyle(viewDisabled)}
              onClick={() => {
                postParentMessage(
                  viewVerifyExtractedData({
                    fileId: row.original.id,
                    isEdit: false,
                  })
                );
              }}
            >
              <EyeIcon
                size={16}
                className={getIconClass(viewDisabled)}
                style={{ marginLeft: "4px" }}
              />
            </MaybeTooltipActionIcon>
            <MaybeTooltipActionIcon
              tooltip="Download"
              disabled={downloadDisabled}
              variant="subtle"
              onClick={() =>
                !downloadDisabled &&
                handleDownload(row?.original?.file_url, row.original?.file_name)
              }
              className="ActionButton"
              style={getStyle(downloadDisabled)}
            >
              <DownloadIcon className={getIconClass(downloadDisabled)} />
            </MaybeTooltipActionIcon>
          </Flex>
        );
      }
      return null;
    },

    renderBottomToolbar: ({ table }) => {
      const startRow = pagination.pageIndex * pagination.pageSize + 1;
      const endRow = Math.min(
        totalCount,
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
                {`${startRow}-${endRow} of ${totalCount}`}
              </Box>
            </React.Fragment>
          )}
        </Flex>
      );
    },
    renderEmptyRowsFallback: () => (
      <Flex justify="center" align="center" py="2rem" w="100%">
        <Text fz={16} c="#868e96" fs="italic">
          No data available
        </Text>
      </Flex>
    ),
    renderTopToolbar: () => (
      <DataImportHistoryToolbar<AIFileUpload>
        table={table}
        allLocations={allLocations}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        onBulkUpload={handleBulkUploadClick}
        onDownloadTemplate={handleDownloadTemplate}
        onAiUpload={handleAiBulkUploadClick}
        onExport={handleExportData}
        initialActivityCode={initialActivityCode}
        isAIEnabled={isAIEnabled}
      />
    ),
  });

  const changeTab = (element: string) => {
    let customFilter: TCustomFilter[] = [];
    if (element !== "All") {
      customFilter.push({ id: "section", value: element });
      setColumnFilters(customFilter);
    } else {
      setColumnFilters(customFilter);
    }
    setCustomFilterValue(element);
  };

  const theme = createTheme({
    components: {
      Text: {
        styles: {
          root: {
            fontSize: "12px",
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "normal",
            color: "#666",
          },
        },
      },
      Table: {
        styles: {
          tbody: {
            borderBottomLeftRadius: "10px",
            borderBottomRightRadius: "10px",
            tr: {
              "&:hover": {
                backgroundColor: "#f1f3f6 !important",
              },
            },
          },
          th: {
            maxHeight: 43,
            fontWeight: "bold",
            padding: "0 10px",
            background: "#003b52",
            color: "#fff",
            fontSize: 12,
            verticalAlign: "middle",
            textTransform: "capitalize",
          },
          td: {
            color: "#444444",
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

  // Calculate section filter counts
  const getCustomSectionFilterCount = useMemo<SectionFilter[]>(() => {
    if (!transformedData) return [];

    const sectionCounts = transformedData.reduce(
      (acc: Record<string, SectionFilter>, row) => {
        const section = row.activity_code;
        if (!acc[section]) {
          acc[section] = {
            activity: section,
            activityHeader:
              section === "energy_grid_power" ? "Energy - Grid" : section,
            count: 0,
          };
        }
        acc[section].count++;
        return acc;
      },
      {}
    );
    return Object.values(sectionCounts);
  }, [transformedData]);

  const InfoCard = ({
    bg,
    borderColor,
    textColor,
    message,
  }: {
    bg: string;
    borderColor: string;
    textColor: string;
    message: string;
  }) => (
    <Card
      p="0"
      bg={bg}
      radius={5}
      styles={{ root: { border: `1px solid ${borderColor}` } }}
    >
      <Text size="14px" fw={500} c={textColor} p="xs">
        {message}
      </Text>
    </Card>
  );
  return (
    <Stack gap={10} className="themeTable">
      {!isAdmin &&
        allResultCount > 0 &&
        (showProcessingUploadingNote || showNoPendingVerificationNote) && (
          <Box mt="xs" mx={30}>
            {showProcessingUploadingNote && (
              <InfoCard
                bg="#fff9ef"
                borderColor="rgba(252, 143, 0, 0.5)"
                textColor="#fc8f00"
                message="You'll receive an email notification once all the files are processed."
              />
            )}
            {showNoPendingVerificationNote && (
              <InfoCard
                bg="#dffdef"
                borderColor="rgba(15, 160, 90, 0.5)"
                textColor="#0FA05A"
                message="No files are pending for verification at this time."
              />
            )}
          </Box>
        )}
      <MantineProvider theme={theme}>
        <MantineReactTable table={table} />
      </MantineProvider>
    </Stack>
  );
};

export default AIDataImportHistoryTable;
