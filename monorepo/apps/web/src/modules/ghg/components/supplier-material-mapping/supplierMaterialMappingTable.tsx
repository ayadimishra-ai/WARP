"use client";

import {
  faSearch,
  faSort,
  faSortDown,
  faSortUp,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import EditIcon from "@/modules/ghg/components/icons/EditIcon";
// import TrashIcon from "@/modules/ghg/components/icons/TrashIcon";
import {
  ActionIcon,
  Box,
  Button,
  createTheme,
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
  MRT_Icons,
  MRT_PaginationState,
  MRT_SortingState,
  MRT_TableOptions,
  MRT_TablePagination,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useUserSession } from "@/modules/ghg/hooks/use-user-session";
import { apiClientWithAuth } from "@/modules/ghg/lib/fetcher";
import {
  IMaterialOption,
  ISupplierAddressMappingOption,
  ISupplierMaterialMappingRow,
  VALID_MONTHS,
} from "@/modules/ghg/lib/supplier-material-mapping/supplier-material-mapping.interface";
import {
  bulkUploadSupplierMaterialMapping,
  postParentMessage,
  supplierMaterialMappingDataChanged,
} from "@/modules/ghg/shared/services/platform-window-message-service";
import Spinner from "@/modules/ghg/shared/UI/spinner/spinner";
import SupplierMaterialMappingEmptyState from "./supplierMaterialMappingEmptyState";
import classes from "./supplierMaterialMappingTable.module.css";

type ValidationErrors = Record<string, string | undefined>;

const MONTH_SELECT_DATA = VALID_MONTHS.map((m) => ({ value: m, label: m }));

const faIcons: Partial<MRT_Icons> = {
  IconArrowsSort: (props: any) => <FontAwesomeIcon icon={faSort} {...props} />,
  IconSortAscending: (props: any) => (
    <FontAwesomeIcon icon={faSortUp} {...props} />
  ),
  IconSortDescending: (props: any) => (
    <FontAwesomeIcon icon={faSortDown} {...props} />
  ),
};

const tableTheme = createTheme({
  components: {
    Table: {
      styles: {
        thead: {
          backgroundColor: "#122f47 !important",
        },
        th: {
          maxHeight: 43,
          backgroundColor: "#122f47 !important",
          color: "white",
          fontWeight: 600,
        },
      },
    },
  },
});

const SupplierMaterialMappingTable: React.FC = () => {
  const session = useUserSession();
  const [data, setData] = useState<ISupplierMaterialMappingRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [hasEverLoaded, setHasEverLoaded] = useState(false);

  const [supplierAddressMappings, setSupplierAddressMappings] = useState<
    ISupplierAddressMappingOption[]
  >([]);
  const [materials, setMaterials] = useState<IMaterialOption[]>([]);

  const [pagination, setPagination] = useState<MRT_PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [debounced] = useDebouncedValue(globalFilter, 200);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const pendingDeleteIdRef = useRef<string | null>(null);

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
        `/api/v1/master-data/supplier-material-mapping/listing?${params.toString()}`
      );

      if (response?.data?.success) {
        setData(response.data.data || []);
        setRowCount(response.data.totalCount || 0);
        setHasEverLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching supplier material mapping list:", error);
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

  const fetchDropdownData = useCallback(async () => {
    if (!session?.organizationId) return;
    try {
      const response = await apiClientWithAuth.get(
        "/api/v1/master-data/supplier-material-mapping/form?action=dropdown-data"
      );
      if (response?.data?.success) {
        setSupplierAddressMappings(response.data.supplierAddressMappings || []);
        setMaterials(response.data.materials || []);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  }, [session?.organizationId]);

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

  useEffect(() => {
    if (session?.organizationId) {
      fetchDropdownData();
    }
  }, [session?.organizationId]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;
      try {
        const parsed = JSON.parse(event.data);

        if (
          parsed.type === "refresh-supplier-material-mapping" ||
          parsed.type === "bulk-page-refresh" ||
          parsed.type === "callApi"
        ) {
          setPagination({ pageIndex: 0, pageSize: 10 });
          setGlobalFilter("");
          fetchData();
        }

        if (
          parsed.type === "confirm-delete-response" &&
          parsed.data?.confirmed &&
          parsed.data?.mappingId === pendingDeleteIdRef.current
        ) {
          executeDelete(parsed.data.mappingId);
        }
      } catch {
        if (event.data === "callApi") {
          setPagination({ pageIndex: 0, pageSize: 10 });
          setGlobalFilter("");
          fetchData();
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [fetchData]);

  const executeDelete = async (mappingId: string) => {
    try {
      const response = await apiClientWithAuth.delete(
        "/api/v1/master-data/supplier-material-mapping/form",
        { data: { id: mappingId } }
      );

      if (response?.data?.success) {
        postParentMessage(supplierMaterialMappingDataChanged(false));
        fetchData();
      } else {
        postParentMessage(supplierMaterialMappingDataChanged(true));
      }
    } catch (error) {
      console.error("Error deleting mapping:", error);
      postParentMessage(supplierMaterialMappingDataChanged(true));
    } finally {
      pendingDeleteIdRef.current = null;
    }
  };

  // const handleDeleteClick = (row: MRT_Row<ISupplierMaterialMappingRow>) => {
  //   const {
  //     id,
  //     supplier_name,
  //     material_name,
  //     From_Year,
  //     From_Month,
  //     To_Year,
  //     To_Month,
  //   } = row.original;
  //   pendingDeleteIdRef.current = id;
  //   postParentMessage(
  //     confirmDeleteSupplierMaterialMapping({
  //       mappingId: id,
  //       supplierName: supplier_name,
  //       materialName: material_name,
  //       fromPeriod: `${From_Month} ${From_Year}`,
  //       toPeriod: `${To_Month} ${To_Year}`,
  //     })
  //   );
  // };

  const validateRow = (values: any) => {
    const errors: ValidationErrors = {};
    if (!values.supplier_address_mapping_id)
      errors.supplier_address_mapping_id = "Please select a supplier.";
    if (!values.org_material_master_id)
      errors.org_material_master_id = "Please select a material.";
    if (!values.From_Year) errors.From_Year = "From Year is required.";
    if (!values.From_Month) errors.From_Month = "From Month is required.";
    if (!values.To_Year) errors.To_Year = "To Year is required.";
    if (!values.To_Month) errors.To_Month = "To Month is required.";
    if (values.From_Year && values.To_Year) {
      if (Number(values.To_Year) < Number(values.From_Year)) {
        errors.To_Year = "To Year must be greater than or equal to From Year.";
      }
      if (
        Number(values.To_Year) === Number(values.From_Year) &&
        values.From_Month &&
        values.To_Month
      ) {
        const fromIdx = VALID_MONTHS.indexOf(values.From_Month);
        const toIdx = VALID_MONTHS.indexOf(values.To_Month);
        if (toIdx < fromIdx) {
          errors.To_Month =
            "To Month must be after or equal to From Month when years are the same.";
        }
      }
    }
    return errors;
  };

  const handleCreateMapping: NonNullable<
    MRT_TableOptions<ISupplierMaterialMappingRow>["onCreatingRowSave"]
  > = async ({ values, exitCreatingMode }) => {
    const errors = validateRow(values);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});

    try {
      const response = await apiClientWithAuth.post(
        "/api/v1/master-data/supplier-material-mapping/form",
        {
          supplier_address_mapping_id: (values as any)
            .supplier_address_mapping_id,
          org_material_master_id: (values as any).org_material_master_id,
          From_Year: Number((values as any).From_Year),
          From_Month: (values as any).From_Month,
          To_Year: Number((values as any).To_Year),
          To_Month: (values as any).To_Month,
        }
      );

      if (response?.data?.success) {
        postParentMessage(supplierMaterialMappingDataChanged(false));
        exitCreatingMode();
        fetchData();
      } else {
        postParentMessage(supplierMaterialMappingDataChanged(true));
      }
    } catch (error: any) {
      const apiErrors = error?.response?.data?.data;
      const fallbackMessage =
        error?.response?.data?.message || "Save failed. Please try again.";
      if (apiErrors) {
        const fieldErrors: ValidationErrors = {};
        Object.entries(apiErrors).forEach(([key, msgs]) => {
          if (key === "duplicate") {
            fieldErrors["supplier_address_mapping_id"] = (msgs as string[])[0];
          } else {
            fieldErrors[key] = (msgs as string[])[0];
          }
        });
        setValidationErrors(fieldErrors);
      } else {
        setValidationErrors({ supplier_address_mapping_id: fallbackMessage });
      }
      postParentMessage(supplierMaterialMappingDataChanged(true));
    }
  };

  const handleEditMapping: NonNullable<
    MRT_TableOptions<ISupplierMaterialMappingRow>["onEditingRowSave"]
  > = async ({ values, row, exitEditingMode }) => {
    const errors = validateRow(values);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});

    try {
      const response = await apiClientWithAuth.put(
        "/api/v1/master-data/supplier-material-mapping/form",
        {
          id: row.original.id,
          supplier_address_mapping_id: (values as any)
            .supplier_address_mapping_id,
          org_material_master_id: (values as any).org_material_master_id,
          From_Year: Number((values as any).From_Year),
          From_Month: (values as any).From_Month,
          To_Year: Number((values as any).To_Year),
          To_Month: (values as any).To_Month,
        }
      );

      if (response?.data?.success) {
        postParentMessage(supplierMaterialMappingDataChanged(false));
        exitEditingMode();
        fetchData();
      } else {
        postParentMessage(supplierMaterialMappingDataChanged(true));
      }
    } catch (error: any) {
      const apiErrors = error?.response?.data?.data;
      const fallbackMessage =
        error?.response?.data?.message || "Save failed. Please try again.";
      if (apiErrors) {
        const fieldErrors: ValidationErrors = {};
        Object.entries(apiErrors).forEach(([key, msgs]) => {
          if (key === "duplicate") {
            fieldErrors["supplier_address_mapping_id"] = (msgs as string[])[0];
          } else {
            fieldErrors[key] = (msgs as string[])[0];
          }
        });
        setValidationErrors(fieldErrors);
      } else {
        setValidationErrors({ supplier_address_mapping_id: fallbackMessage });
      }
      postParentMessage(supplierMaterialMappingDataChanged(true));
    }
  };

  const supplierSelectData = supplierAddressMappings.map((s) => ({
    value: s.id,
    label: `${s.supplier_name} (${s.supplier_code})`,
  }));

  const materialSelectData = materials.map((m) => ({
    value: m.id,
    label: `${m.name} (${m.code})`,
  }));

  const columns: MRT_ColumnDef<ISupplierMaterialMappingRow>[] = [
    {
      accessorKey: "from_period",
      header: "From Period",
      size: 140,
      Cell: ({ cell }) => cell.getValue<string>() || "-",
    },
    {
      accessorKey: "to_period",
      header: "To Period",
      size: 140,
      Cell: ({ cell }) => cell.getValue<string>() || "-",
    },
    {
      accessorKey: "supplier_code_name",
      header: "Supplier Code & Name",
      Cell: ({ cell }) => {
        const val = cell.getValue<string>();
        return val ? (
          <span
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 200,
            }}
          >
            {val}
          </span>
        ) : (
          "-"
        );
      },
    },
    {
      accessorKey: "supplier_address_code_name",
      header: "Supplier Location Code & Name",
      Cell: ({ cell }) => {
        const val = cell.getValue<string>();
        return val ? (
          <span
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 200,
            }}
          >
            {val}
          </span>
        ) : (
          "-"
        );
      },
    },
    {
      accessorKey: "material_master_code_name",
      header: "Material Code & Name",
      Cell: ({ cell }) => {
        const val = cell.getValue<string>();
        return val ? (
          <span
            style={{
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 200,
            }}
          >
            {val}
          </span>
        ) : (
          "-"
        );
      },
    },
  ];

  const table = useMantineReactTable({
    columns,
    data,
    createDisplayMode: "row",
    editDisplayMode: "row",
    // enableEditing: true,
    // enableRowActions: true,
    // positionActionsColumn: "last",
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount,
    paginationDisplayMode: "pages",
    enableRowNumbers: true,
    rowNumberDisplayMode: "original",
    icons: faIcons,
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
      isLoading: isLoading && !hasEverLoaded,
      showProgressBars: isRefetching,
    },
    // onCreatingRowSave: handleCreateMapping,
    // onCreatingRowCancel: () => setValidationErrors({}),
    // onEditingRowSave: handleEditMapping,
    // onEditingRowCancel: () => setValidationErrors({}),
    enableRowSelection: false,
    enableColumnActions: false,
    enableColumnFilters: false,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableGlobalFilter: false,
    positionToolbarAlertBanner: "none",
    renderToolbarInternalActions: () => <></>,
    mantinePaperProps: {
      className: classes.SupplierMaterialMappingTableStyle,
    },
    mantineProgressProps: ({ isTopToolbar }: any) => ({
      color: "#72D0C6",
      style: { display: isTopToolbar ? "block" : "none" },
      value: 100,
    }),
    mantinePaginationProps: {
      style: { border: 0 },
    },
    displayColumnDefOptions: {
      // "mrt-row-actions": { size: 80, Header: "Action" },
      "mrt-row-numbers": {
        size: 20,
        Header: "SN",
        mantineTableHeadCellProps: {
          style: { paddingTop: 14, fontSize: 12, paddingLeft: 10 },
        },
      },
    },
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
          <Text
            style={{
              fontWeight: 600,
              color: "#FFA93C",
              margin: "10px 10px 10px 0",
              fontSize: "14px",
              lineHeight: "24px",
            }}
          >
            All ({rowCount})
          </Text>
        </Flex>
        <Flex gap={10} align="center">
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
                  size="sm"
                  variant="subtle"
                  onClick={() => setGlobalFilter("")}
                  style={{
                    color: "#444444",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  <FontAwesomeIcon icon={faXmark} style={{ fontSize: 12 }} />
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
                fw={600}
                fz={12}
                h={36}
                lts="0.15rem"
                p="0 20px"
                radius="xl"
                className="noAnimationButton filledGradientButton"
                rightSection={<IconChevronDown size={14} />}
              >
                ADD DATA
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {/* <Menu.Item onClick={handleAddMapping}>Add Mapping</Menu.Item> */}
              <Menu.Item
                onClick={() =>
                  postParentMessage(bulkUploadSupplierMaterialMapping())
                }
              >
                Bulk Upload Data
              </Menu.Item>
              <Menu.Item onClick={handleDownloadTemplate}>
                Download Template
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      </Group>
    ),
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
                <Text fz="12px" c="#666666" style={{ whiteSpace: "nowrap" }}>
                  {startRow}–{endRow} of {rowCount}
                </Text>
              </Box>
            </React.Fragment>
          )}
        </Flex>
      );
    },
    // renderRowActions: ({ row, table }) => {
    //   const isEditing =
    //     table.getState().editingRow?.id === row.id ||
    //     table.getState().creatingRow?.id === row.id;

    //   if (isEditing) return null;

    //   return (
    //     <Flex gap="md" align="center">
    //       <ActionIcon
    //         aria-label="Edit mapping"
    //         onClick={() => {
    //           setValidationErrors({});
    //           table.setEditingRow(row);
    //         }}
    //       >
    //         <EditIcon />
    //       </ActionIcon>
    //       <ActionIcon
    //         aria-label="Delete mapping"
    //         onClick={() => handleDeleteClick(row)}
    //       >
    //         <TrashIcon color="#e03131" />
    //       </ActionIcon>
    //     </Flex>
    //   );
    // },
  });

  // const handleAddMapping = () => {
  //   if (table.getState().creatingRow || table.getState().editingRow) return;
  //   setValidationErrors({});
  //   table.setCreatingRow(true);
  // };

  const handleDownloadTemplate = async () => {
    try {
      const response = await apiClientWithAuth.get(
        "/api/v1/master-data/supplier-material-mapping/template"
      );

      console.log("Template URL response:", response);

      if (response?.data?.success && response?.data?.data?.url) {
        console.log("Downloading template from URL:", response.data.data.url);
        const url = response.data.data.url;

        const urlPath = new URL(url).pathname;
        const filename = urlPath.substring(urlPath.lastIndexOf("/") + 1);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          filename || "Supplier Material Mapping.xlsx"
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

  if (isLoading && !hasEverLoaded) {
    return <Spinner />;
  }

  if (!isLoading && hasEverLoaded && rowCount === 0 && !debounced) {
    return (
      <SupplierMaterialMappingEmptyState
        onDownloadTemplate={handleDownloadTemplate}
      />
    );
  }

  return (
    <>
      <MantineProvider>
        <Flex align="center" justify="space-between" mt="27px" mb="md">
          <Text fz="22px" c="#444444" fw="400" lh="normal">
            Supplier Material Mapping
          </Text>
        </Flex>
        <MantineReactTable table={table} />
      </MantineProvider>
    </>
  );
};

export default SupplierMaterialMappingTable;
