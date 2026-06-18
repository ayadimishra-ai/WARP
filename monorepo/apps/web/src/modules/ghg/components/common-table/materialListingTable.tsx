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
  Menu,
  TextInput,
} from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { type MRT_ColumnDef, type MRT_Icons } from "mantine-react-table";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { apiClientWithAuth } from "@/modules/ghg/lib/fetcher";
import { downloadMaterialMasterTemplate } from "@/modules/ghg/shared/services/material-master.service";
import {
  bulkUploadMaterial,
  postParentMessage,
} from "@/modules/ghg/shared/services/platform-window-message-service";
import AddMaterialPage from "../material-listing-add-material/addMaterialPage";
import CommonTable from "./commonTable";
import classes from "./CSS.module.css";

config.autoAddCss = false;

// Define the Material type to match the OrgMaterialMaster table
type Material = {
  id: string;
  name: string;
  code: string;
  type: string;
  Material_Classification: string;
  Material_Description: string;
  Material_Weight_Per_Unit: number;
  UoM_Material_Weight: string;
  Additional_Information: string;
};

const columns: MRT_ColumnDef<Material>[] = [
  {
    accessorKey: "code",
    header: "Material Code",
    enableColumnFilter: false,
    Cell: ({ cell }) => {
      const value = cell.getValue();
      return value && String(value).trim() !== "" ? String(value) : "-";
    },
  },
  {
    accessorKey: "name",
    header: "Material Name",
    enableColumnFilter: false,
    Cell: ({ cell }) => {
      const value = cell.getValue();
      return value && String(value).trim() !== "" ? String(value) : "-";
    },
  },
  {
    accessorKey: "type",
    header: "Material Type",
    enableColumnFilter: false,
    Cell: ({ cell }) => {
      const value = cell.getValue();
      return value && String(value).trim() !== "" ? String(value) : "-";
    },
  },
  {
    accessorKey: "Material_Weight_Per_Unit",
    header: "Material Weight",
    enableColumnFilter: false,
    Cell: ({ cell }) => {
      const value = cell.getValue();
      return value !== null && value !== undefined ? String(value) : "-";
    },
  },
  {
    accessorKey: "UoM_Material_Weight",
    header: "UoM Material Weight",
    enableColumnFilter: false,
    Cell: ({ cell }) => {
      const value = cell.getValue();
      return value && String(value).trim() !== "" ? String(value) : "-";
    },
  },
  {
    accessorKey: "Material_Classification",
    header: "Material Classification",
    enableColumnFilter: false,
    Cell: ({ cell }) => {
      const value = cell.getValue();
      return value && String(value).trim() !== "" ? String(value) : "-";
    },
  },
  {
    accessorKey: "Material_Description",
    header: "Material Description",
    enableColumnFilter: false,
    Cell: ({ cell }) => {
      const value = cell.getValue();
      return value && String(value).trim() !== "" ? String(value) : "-";
    },
  },
  {
    accessorKey: "Additional_Information",
    header: "Additional Information",
    enableColumnFilter: false,
    Cell: ({ cell }) => {
      const value = cell.getValue();
      return value && String(value).trim() !== "" ? String(value) : "-";
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

const MaterialListingTable = () => {
  const params = useParams();
  const [materialList, setMaterialList] = useState<Material[]>([]);
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
    if (debouncedSearchTerm !== searchTerm) return;
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, [debouncedSearchTerm, searchTerm]);

  // Reset pagination when sorting changes
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, [sorting]);

  // Reset to initial load when organization or access token changes
  useEffect(() => {
    isInitialLoad.current = true;
  }, [params?.accessToken, params?.organizationId]);

  useEffect(() => {
    const getMaterialData = async () => {
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

      let materialData;
      try {
        const response = await apiClientWithAuth.get(
          "/api/v1/master-data/materials/listing?" + queryParams.toString()
        );
        materialData = response.data;
      } catch (error) {
        console.error("Error fetching material data:", error);
        materialData = {
          data: { materialList: [], pagination: { totalCount: 0 } },
        };
      }

      // Set total count from server response
      setTotalCount(materialData?.data?.pagination?.totalCount || 0);

      // Use raw data directly from API
      setMaterialList(materialData?.data?.materialList || []);

      setIsLoading(false);
      setIsRefetching(false);
    };
    getMaterialData();
  }, [
    params?.accessToken,
    params?.organizationId,
    pagination.pageIndex,
    pagination.pageSize,
    debouncedSearchTerm,
    sorting,
  ]);

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
                  className={classes.clearSearchButton}
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
          <Menu position="bottom" offset={5} width={200} shadow="md">
            <Menu.Target>
              <Button
                variant="unstyled"
                fw={600}
                fz={12}
                h={36}
                lts="0.15rem"
                p="0 20px"
                radius="xl"
                rightSection={
                  <IconChevronDown
                    size={14}
                    stroke={2.5}
                    style={{ marginLeft: "3px" }}
                  />
                }
                className="noAnimationButton filledGradientButton"
              >
                ADD DATA
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                onClick={() => {
                  postParentMessage(bulkUploadMaterial());
                }}
                styles={{
                  item: {
                    "&:hover, &:active, &[data-hovered]": {
                      background:
                        "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
                      color: "#FFFFFF",
                    },
                  },
                }}
              >
                Bulk Upload Data
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  downloadMaterialMasterTemplate();
                }}
                styles={{
                  item: {
                    "&:hover, &:active, &[data-hovered]": {
                      background:
                        "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
                      color: "#FFFFFF",
                    },
                  },
                }}
              >
                Download Template
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
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
    enableMultiRowSelection: false,
    enableRowSelection: true,
    initialState: {
      showColumnFilters: true,
      showGlobalFilter: true,
      pagination: { pageSize: 10, pageIndex: 0 },
    },
    state: {
      pagination,
      sorting,
      isLoading: isLoading,
      showProgressBars: isRefetching,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount: totalCount,
    columnFilterDisplayMode: "popover",
    manualFiltering: false,
    manualPagination: true,
    manualSorting: true,
    enableFilterMatchHighlighting: false,
    enableColumnFilters: true,
    paginationDisplayMode: "pages",
    enablePagination: true,
    mantinePaginationProps: {
      style: {
        border: 0,
      },
    },
    getRowId: (row: Material) => row.id || String(row),
    mantineTableBodyRowProps: ({ row }: any) => ({
      onClick: row.getToggleSelectedHandler(),
      sx: { cursor: "pointer" },
    }),
    mantineSelectCheckboxProps: { color: "#72D0C6", size: "sm" },
    positionToolbarAlertBanner: "none",
    mantinePaperProps: { className: classes.FormTablestyle },
    mantineProgressProps: ({ isTopToolbar }: any) => ({
      color: "#72D0C6",
      style: { display: isTopToolbar ? "block" : "none" },
      value: 100,
    }),
    enableGlobalFilter: false,
    displayColumnDefOptions: {
      // "mrt-row-actions": { size: 50, Header: "Action" }, // Commented out - Action column not needed currently
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
    // Action column configuration - Commented out for future reference
    // enableRowActions: true,
    // positionActionsColumn: "last",
    // renderRowActions: ({ row }: any) => (
    //   <ActionIcon
    //     onClick={() => {
    //       postParentMessage(addEditMaterial(true, row?.original?.id));
    //     }}
    //   >
    //     <EditIcon />
    //   </ActionIcon>
    // ),
  };

  // Show AddMaterialPage only when no filters applied and no data
  const hasNoFiltersApplied =
    pagination?.pageIndex === 0 &&
    debouncedSearchTerm?.trim() === "" &&
    sorting?.length === 0;

  if (
    !isLoading &&
    !isRefetching &&
    materialList.length === 0 &&
    hasNoFiltersApplied
  ) {
    return <AddMaterialPage />;
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
        List of Materials
      </h2>

      <CommonTable
        data={materialList}
        columns={columns}
        tableConfig={tableConfig}
      />
    </>
  );
};

export default MaterialListingTable;
