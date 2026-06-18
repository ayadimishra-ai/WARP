"use client";

import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ActionIcon,
  Button,
  ComboboxItem,
  Flex,
  MantineProvider,
  Select,
  Stack,
  Tabs,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { useEffect, useState } from "react";
import {
  useEmissionFactorDataTable,
  useMaterialEmissionFactorDataTable,
} from "../hooks/use-emission-factor-data-table";
import { getOrgList } from "./emission-factor-table-server";
import classes from "./emission-factor-table.module.css";

const EmissionFactorTable = () => {
  const [orgId, setOrgId] = useState<string>(crypto?.randomUUID());
  const [orgListDropDown, setOrgListDropDown] = useState<ComboboxItem[]>([]);
  // State for search functionality
  const [commonGlobalFilter, setCommonGlobalFilter] = useState("");
  const [localCommonGlobalFilter, setLocalCommonGlobalFilter] = useState("");
  const [materialGlobalFilter, setMaterialGlobalFilter] = useState("");
  const [localMaterialGlobalFilter, setLocalMaterialGlobalFilter] =
    useState("");
  const [activeTab, setActiveTab] = useState("common");
  const initialPagination = { pageIndex: 0, pageSize: 10 };
  const {
    commonEmissionFactorTableColumns,
    handleCreateNewEmissionFactor,
    handleEditRowSave,
    validationErrors,
    setValidationErrors,
    loading,
    commonEmissionFactorData,
    isSaving,
    pagination,
    setPagination,
    totalCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
  } = useEmissionFactorDataTable(
    activeTab === "material",
    activeTab,
    initialPagination,
    commonGlobalFilter
  );
  const {
    materialEmissionFactorTableColumns,
    handleCreateNewMaterialEmissionFactor,
    handleEditMaterialRowSave,
    setMaterialValidationErrors,
    materialLoading,
    materialEmissionFactorData,
    isMaterialSaving,
    pagination: materialPagination,
    setPagination: setMaterialPagination,
    totalCount: materialTotalCount,
    sorting: materialSorting,
    setSorting: setMaterialSorting,
    columnFilters: materialColumnFilters,
    setColumnFilters: setMaterialColumnFilters,
  } = useMaterialEmissionFactorDataTable(
    activeTab === "material",
    orgId,
    activeTab,
    initialPagination,
    materialGlobalFilter
  );
  useEffect(() => {
    const fetchOrgList = async () => {
      if (activeTab === "material") {
        const orgList = await getOrgList();
        setOrgListDropDown(
          orgList?.Organization?.map((items) => {
            return {
              label: items?.name,
              value: items?.id,
            };
          }) || []
        );
      }
    };
    fetchOrgList();
  }, [activeTab]);
  useEffect(() => {
    if (!!orgListDropDown && orgListDropDown?.length > 0) {
      setOrgId(orgListDropDown[0]?.value);
    }
  }, [orgListDropDown, activeTab]);

  // Debounce effects for global filters
  useEffect(() => {
    const timer = setTimeout(
      () => setCommonGlobalFilter(localCommonGlobalFilter),
      500
    );
    return () => clearTimeout(timer);
  }, [localCommonGlobalFilter]);

  useEffect(() => {
    const timer = setTimeout(
      () => setMaterialGlobalFilter(localMaterialGlobalFilter),
      500
    );
    return () => clearTimeout(timer);
  }, [localMaterialGlobalFilter]);

  // Local states for debounced column filters
  const [localColumnFilters, setLocalColumnFilters] = useState<any[]>([]);
  const [localMaterialColumnFilters, setLocalMaterialColumnFilters] = useState<
    any[]
  >([]);

  // Debounce effects for column filters
  useEffect(() => {
    const timer = setTimeout(() => setColumnFilters(localColumnFilters), 500);
    return () => clearTimeout(timer);
  }, [localColumnFilters, setColumnFilters]);

  useEffect(() => {
    const timer = setTimeout(
      () => setMaterialColumnFilters(localMaterialColumnFilters),
      500
    );
    return () => clearTimeout(timer);
  }, [localMaterialColumnFilters, setMaterialColumnFilters]);

  // Theme configuration matching CommonTable styling
  const tableTheme = {
    components: {
      MantineReactTable: {
        styles: {
          header: {
            backgroundColor: "#003b52",
            color: "#fff",
            fontWeight: 600,
            maxHeight: "43px",
          },
        },
      },
    },
  };
  const commonemissionFactorTable = useMantineReactTable({
    columns: commonEmissionFactorTableColumns,
    data: commonEmissionFactorData?.emissionFactorList || [],
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableGlobalFilterModes: false,
    enableDensityToggle: false,
    enableColumnActions: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableTopToolbar: false,
    enableBottomToolbar: true,
    globalFilterFn: "fuzzy",
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: totalCount,
    createDisplayMode: "row",
    editDisplayMode: "row",
    enableEditing: true,
    enableSorting: true,
    getRowId: (row) => row.id,
    paginationDisplayMode: "pages",
    enableStickyHeader: true,
    enableRowActions: true,
    positionActionsColumn: "last",
    initialState: {
      pagination: initialPagination,
      showGlobalFilter: true,
      columnVisibility: { id: false },
      showColumnFilters: true,
    },
    columnFilterDisplayMode: "popover",
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateNewEmissionFactor,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleEditRowSave,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setLocalColumnFilters,
    renderRowActions: ({ row, table }) => (
      <Flex gap="md">
        <Tooltip label="Edit">
          <ActionIcon onClick={() => table.setEditingRow(row)}>
            <IconEdit color="#003b52  " />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
    state: {
      isLoading: loading,
      isSaving: isSaving,
      globalFilter: localCommonGlobalFilter,
      pagination,
      sorting,
      columnFilters: localColumnFilters,
    },
    onGlobalFilterChange: setLocalCommonGlobalFilter,
  });
  const materialEmissionFactorTable = useMantineReactTable({
    columns: materialEmissionFactorTableColumns,
    data: materialEmissionFactorData?.materialEmissionFactorList || [],
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableGlobalFilterModes: false,
    enableDensityToggle: false,
    enableColumnActions: false,
    enableFullScreenToggle: false,
    enableHiding: false,
    enableTopToolbar: false,
    enableBottomToolbar: true,
    globalFilterFn: "fuzzy",
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: materialTotalCount,
    createDisplayMode: "row",
    editDisplayMode: "row",
    enableEditing: true,
    enableSorting: true,
    getRowId: (row) => row.id,
    paginationDisplayMode: "pages",
    enableStickyHeader: true,
    enableRowActions: true,
    positionActionsColumn: "last",
    initialState: {
      pagination: initialPagination,
      showGlobalFilter: true,
      columnVisibility: { id: false },
      showColumnFilters: true,
    },
    columnFilterDisplayMode: "popover",
    onCreatingRowCancel: () => setMaterialValidationErrors({}),
    onCreatingRowSave: handleCreateNewMaterialEmissionFactor,
    onEditingRowCancel: () => setMaterialValidationErrors({}),
    onEditingRowSave: handleEditMaterialRowSave,
    onPaginationChange: setMaterialPagination,
    onSortingChange: setMaterialSorting,
    onColumnFiltersChange: setLocalMaterialColumnFilters,
    renderRowActions: ({ row, table }) => (
      <Flex gap="md">
        <Tooltip label="Edit">
          <ActionIcon onClick={() => table.setEditingRow(row)}>
            <IconEdit color="#003b52  " />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
    state: {
      isLoading: materialLoading,
      isSaving: isMaterialSaving,
      globalFilter: localMaterialGlobalFilter,
      pagination: materialPagination,
      sorting: materialSorting,
      columnFilters: localMaterialColumnFilters,
    },
    onGlobalFilterChange: setLocalMaterialGlobalFilter,
  });
  return (
    <MantineProvider theme={tableTheme}>
      <Stack gap={10}>
        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onChange={(value) => setActiveTab(String(value))}
          classNames={{
            list: classes.list,
            tab: classes.tab,
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="common">Common Emissions</Tabs.Tab>
            <Tabs.Tab value="material">Material Emissions</Tabs.Tab>
          </Tabs.List>

          {/* TAB 1 */}
          <Tabs.Panel value="common" pt="xs">
            <Flex
              direction="row"
              justify="space-between"
              px={10}
              gap={10}
              py={12}
            >
              <Flex></Flex>
              <Flex gap={10} align="center">
                <TextInput
                  placeholder="Search..."
                  value={localCommonGlobalFilter}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    setLocalCommonGlobalFilter(value);
                  }}
                  leftSection={
                    <FontAwesomeIcon
                      icon={faSearch}
                      style={{ fontSize: 14, color: "#666" }}
                    />
                  }
                  rightSection={
                    localCommonGlobalFilter && (
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => {
                          setLocalCommonGlobalFilter("");
                        }}
                        c="#666"
                        style={{
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "12px",
                          color: "#666 !important",
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
                  onClick={() => commonemissionFactorTable.setCreatingRow(true)}
                >
                  ADD DATA
                </Button>
              </Flex>
            </Flex>
            <div className={`${classes.FormTablestyle} themeTable`}>
              <MantineReactTable table={commonemissionFactorTable} />
            </div>
          </Tabs.Panel>

          {/* TAB 2 */}
          <Tabs.Panel value="material" pt="xs">
            <Flex
              direction="row"
              justify="space-between"
              px={10}
              gap={10}
              py={12}
            >
              <Flex justify="flex-start" px={0} gap={10}>
                <Select
                  placeholder="Filter by organization"
                  data={orgListDropDown}
                  value={orgId}
                  onChange={(e) => {
                    setOrgId(String(e));
                  }}
                  autoSelectOnBlur
                  searchable
                  miw="20vw"
                />
              </Flex>
              <Flex gap={10} align="center">
                <TextInput
                  placeholder="Search..."
                  value={localMaterialGlobalFilter}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    setLocalMaterialGlobalFilter(value);
                  }}
                  leftSection={
                    <FontAwesomeIcon
                      icon={faSearch}
                      style={{ fontSize: 14, color: "#666" }}
                    />
                  }
                  rightSection={
                    localMaterialGlobalFilter && (
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        onClick={() => {
                          setLocalMaterialGlobalFilter("");
                        }}
                        c="#666"
                        style={{
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "12px",
                          color: "#666 !important",
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
                  onClick={() =>
                    materialEmissionFactorTable.setCreatingRow(true)
                  }
                >
                  ADD DATA
                </Button>
              </Flex>
            </Flex>
            <div className={`${classes.FormTablestyle} themeTable`}>
              <MantineReactTable table={materialEmissionFactorTable} />
            </div>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </MantineProvider>
  );
};

export default EmissionFactorTable;
