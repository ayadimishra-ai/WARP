import { ActionIcon, Box, Flex, Tooltip } from "@mantine/core";
import { IconFileDownload, IconUpload } from "@tabler/icons-react";
import {
  MRT_GlobalFilterTextInput,
  MRT_TableInstance,
} from "mantine-react-table";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CheckboxMultiSelect from "~/app/[organizationId]/embed/v1/[accessToken]/data-log-summary/CheckboxMultiSelect";
import {
  getUserRoleFromToken,
  ROLE_ORGANIZATION_ADMIN,
} from "~/utils/jwt/getUserDataFromToken";
import AISparkleIcon from "../icons/AISparkleIcon";
import SearchIcon from "../icons/SearchIcon";

interface DataImportHistoryToolbarProps<TData extends Record<string, any>> {
  table: MRT_TableInstance<TData>;
  allLocations: Array<{ value: string; label: string }>;
  selectedLocation: string[];
  onLocationChange: (value: string[]) => void;
  onBulkUpload: () => void;
  onDownloadTemplate: () => void;
  onAiUpload: () => void;
  onExport: () => void;
  initialActivityCode?: string | null;
  isAIEnabled?: boolean;
  /** When true (prepopulate mode + has existing data), Upload and Download buttons are hidden */
  disableUploadDownload?: boolean;
}

export const DataImportHistoryToolbar = <TData extends Record<string, any>>({
  table,
  allLocations,
  selectedLocation,
  onLocationChange,
  onBulkUpload,
  onDownloadTemplate,
  onAiUpload,
  onExport,
  initialActivityCode,
  isAIEnabled,
  disableUploadDownload = false,
}: DataImportHistoryToolbarProps<TData>) => {
  const [isGlobalFilterOpen, setIsGlobalFilterOpen] = useState(false);
  const [hoveredIconKey, setHoveredIconKey] = useState<string | null>(null);
  const globalFilterRef = useRef<HTMLDivElement | null>(null);
  const globalFilterContainerRef = useRef<HTMLDivElement | null>(null);
  const params = useParams();
  const userRole = getUserRoleFromToken(
    params?.accessToken as string | string[] | undefined
  );
  const isAdmin =
    Array.isArray(userRole) && userRole.includes(ROLE_ORGANIZATION_ADMIN);

  const handleSearchToggle = () => {
    setIsGlobalFilterOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          const input = globalFilterRef.current?.querySelector(
            "input"
          ) as HTMLInputElement | null;
          input?.focus();
        }, 180);
      }
      return next;
    });
  };

  const handleIconMouseEnter = (key: string) => setHoveredIconKey(key);
  const handleIconMouseLeave = () => setHoveredIconKey(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isGlobalFilterOpen &&
        globalFilterContainerRef.current &&
        !globalFilterContainerRef.current.contains(event.target as Node)
      ) {
        setIsGlobalFilterOpen(false);
      }
    };

    if (isGlobalFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isGlobalFilterOpen]);
  return (
    <Flex
      justify="space-between"
      align="center"
      wrap="wrap"
      gap={15}
      mb={15}
      px={30}
    >
      <CheckboxMultiSelect
        data={allLocations}
        value={selectedLocation}
        onChange={onLocationChange}
        placeholder="Select locations"
        style={{ width: 300 }}
        height={210}
      />
      <Flex gap={10} align="center" ref={globalFilterContainerRef}>
        <Box
          ref={globalFilterRef}
          style={{
            width: isGlobalFilterOpen ? 251 : 0,
            opacity: isGlobalFilterOpen ? 1 : 0,
            transform: isGlobalFilterOpen
              ? "translateX(0px)"
              : "translateX(18px)",
            transition:
              "width 220ms ease, opacity 80ms ease, transform 220ms ease",
            overflow: "hidden",
            pointerEvents: isGlobalFilterOpen ? "auto" : "none",
          }}
        >
          <MRT_GlobalFilterTextInput table={table} />
        </Box>
        {!isGlobalFilterOpen && (
          <Tooltip
            label="Search"
            offset={10}
            withArrow
            arrowSize={10}
            position="top"
          >
            <ActionIcon
              variant="outline"
              size={36}
              aria-label="Search"
              onClick={handleSearchToggle}
              onMouseEnter={() => handleIconMouseEnter("search")}
              onMouseLeave={handleIconMouseLeave}
              style={{
                color: hoveredIconKey === "search" ? "#1c7ed6" : "#0B5D76",
                borderColor:
                  hoveredIconKey === "search" ? "#1c7ed6" : "#ced4da",
                backgroundColor:
                  hoveredIconKey === "search" ? "#e7f5ff" : "transparent",
                cursor: "pointer",
              }}
            >
              <SearchIcon color="currentColor" />
            </ActionIcon>
          </Tooltip>
        )}
        {!isAdmin && !isAIEnabled && !disableUploadDownload && (
          <Tooltip
            label="Bulk Upload"
            offset={10}
            withArrow
            arrowSize={10}
            position="top"
          >
            <ActionIcon
              variant="outline"
              size={36}
              aria-label="Bulk Upload"
              onClick={onBulkUpload}
              onMouseEnter={() => handleIconMouseEnter("upload")}
              onMouseLeave={handleIconMouseLeave}
              style={{
                color: hoveredIconKey === "upload" ? "#1c7ed6" : "#0B5D76",
                borderColor: hoveredIconKey === "upload" ? "#1c7ed6" : "#ced4da",
                backgroundColor: hoveredIconKey === "upload" ? "#e7f5ff" : "transparent",
                cursor: "pointer",
              }}
            >
              <IconUpload color="currentColor" />
            </ActionIcon>
          </Tooltip>
        )}
        {!isAdmin &&
          isAIEnabled &&
          initialActivityCode === "energy_grid_power" && (
            <Tooltip
              label="AI Powered Upload"
              offset={10}
              withArrow
              arrowSize={10}
              position="top"
            >
              <ActionIcon
                variant="outline"
                size={36}
                aria-label="AI Powered Upload"
                onClick={onAiUpload}
                onMouseEnter={() => handleIconMouseEnter("ai")}
                onMouseLeave={handleIconMouseLeave}
                style={{
                  color: hoveredIconKey === "ai" ? "#1c7ed6" : "#0B5D76",
                  borderColor: hoveredIconKey === "ai" ? "#1c7ed6" : "#ced4da",
                  backgroundColor:
                    hoveredIconKey === "ai" ? "#e7f5ff" : "transparent",
                  cursor: "pointer",
                }}
              >
                <AISparkleIcon />
              </ActionIcon>
            </Tooltip>
          )}
        {!isAdmin && !isAIEnabled && !disableUploadDownload && (
          <Tooltip
            label={
              initialActivityCode
                ? "Download Template"
                : "Select an activity to download template"
            }
            offset={10}
            withArrow
            arrowSize={10}
            position="top"
          >
            <ActionIcon
              variant="outline"
              size={36}
              aria-label="Download Template"
              onClick={!initialActivityCode ? undefined : onDownloadTemplate}
              onMouseEnter={() => handleIconMouseEnter("download")}
              onMouseLeave={handleIconMouseLeave}
              style={{
                color: !initialActivityCode ? "#9ca3af" : hoveredIconKey === "download" ? "#1c7ed6" : "#0B5D76",
                borderColor: !initialActivityCode ? "#e5e7eb" : hoveredIconKey === "download" ? "#1c7ed6" : "#ced4da",
                backgroundColor: !initialActivityCode ? "transparent" : hoveredIconKey === "download" ? "#e7f5ff" : "transparent",
                cursor: !initialActivityCode ? "not-allowed" : "pointer",
                opacity: !initialActivityCode ? 0.5 : 1,
              }}
              disabled={!initialActivityCode}
            >
              <IconFileDownload color="currentColor" />
            </ActionIcon>
          </Tooltip>
        )}
        {/* Out of scope for this current sprint */}
        {/* <Tooltip
          label="Export"
          offset={10}
          withArrow
          arrowSize={10}
          position="top"
        >
          <ActionIcon
            variant="outline"
            size={36}
            aria-label="Export"
            onClick={onExport}
            onMouseEnter={() => handleIconMouseEnter("export")}
            onMouseLeave={handleIconMouseLeave}
            style={{
              color: hoveredIconKey === "export" ? "#1c7ed6" : "#0B5D76",
              borderColor: hoveredIconKey === "export" ? "#1c7ed6" : "#ced4da",
              backgroundColor:
                hoveredIconKey === "export" ? "#e7f5ff" : "transparent",
              cursor: "pointer",
            }}
          >
            <IconFileSymlink color="currentColor" />
          </ActionIcon>
        </Tooltip> */}
      </Flex>
    </Flex>
  );
};
