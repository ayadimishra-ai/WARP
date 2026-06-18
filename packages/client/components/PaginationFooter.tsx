import { Flex, Pagination, Select, Text } from "@mantine/core";
import { FC } from "react";
import { FaCaretDown } from "react-icons/fa";

interface PaginationFooterProps {
  // Pagination props
  activePage: number;
  setActivePage: (page: number) => void;
  totalPages: number;

  // Items per page props
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
  filteredDataLength: number;

  // Customization props
  itemsPerPageOptions?: number[];
  showItemsPerPage?: boolean;
  showRangeText?: boolean;
  paginationStyles?: Record<string, any>;

  // Layout props
  reverse?: boolean; // If true, shows items per page on left, pagination on right
  gap?: number;
  pt?: number;
}

const PaginationFooter: FC<PaginationFooterProps> = ({
  activePage,
  setActivePage,
  totalPages,
  itemsPerPage,
  setItemsPerPage,
  filteredDataLength,
  itemsPerPageOptions = [5, 10, 15, 20, 25, 50],
  showItemsPerPage = true,
  showRangeText = true,
  paginationStyles = {
    item: {
      borderRadius: "50%",
      border: "0",
      width: "32px",
      backgroundColor: "#F7F9FB",
      "&[data-active]": {
        backgroundColor: "#003b52",
        color: "#fff",
      },
      marginTop: 10,
      "&:hover": {
        backgroundColor: "#005C81",
        color: "#fff",
      },
    },
  },
  reverse = false,
  gap = 10,
  pt = 10,
}) => {
  const handlePageChange = (page: number) => {
    setActivePage(page);
  };

  const handleItemsPerPageChange = (value: string | null) => {
    if (value) {
      const newItemsPerPage = parseInt(value);
      setItemsPerPage(newItemsPerPage);
      // Reset to first page when changing items per page
      setActivePage(1);
    }
  };

  // Calculate the range of items currently shown
  const startIndex = (activePage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(activePage * itemsPerPage, filteredDataLength);

  const PaginationComponent = (
    <Pagination
      classNames={paginationStyles}
      total={totalPages}
      page={activePage}
      onChange={handlePageChange}
    />
  );

  const ItemsPerPageComponent = showItemsPerPage ? (
    <Flex align="center" gap={gap}>
      <Text size={14} color="#444444">
        Items per page:
      </Text>
      <Select
        value={itemsPerPage.toString()}
        onChange={handleItemsPerPageChange}
        data={itemsPerPageOptions.map((option) => ({
          value: option.toString(),
          label: option.toString(),
        }))}
        rightSection={
          <span>{FaCaretDown({ color: "#9098a9", size: 20 })}</span>
        }
        w={60}
        size="sm"
        styles={{
          input: {
            backgroundColor: "#F7F9FB",
            border: "1px solid #E4E4E4",
            borderRadius: "3px",
            fontSize: "14px",
            fontWeight: 400,
            color: "#444444",
            cursor: "pointer",
            "&:focus": {
              borderColor: "#005C81",
            },
          },
          rightSection: {
            pointerEvents: "none",
          },
          item: {
            "&[data-selected]": {
              backgroundColor: "#005C81",
              color: "white",
              "&:hover": {
                backgroundColor: "#005C81",
                color: "white",
              },
            },
            "&:hover": {
              backgroundColor: "#005C81",
              color: "white",
            },
          },
        }}
      />
      {showRangeText && (
        <Text size={14} color="#444444">
          {startIndex}-{endIndex} of {filteredDataLength}
        </Text>
      )}
    </Flex>
  ) : null;

  const leftComponent = reverse ? ItemsPerPageComponent : PaginationComponent;
  const rightComponent = reverse ? PaginationComponent : ItemsPerPageComponent;

  return (
    <Flex justify="space-between" align="center" pt={pt} wrap="wrap" gap={gap}>
      {leftComponent}
      {rightComponent}
    </Flex>
  );
};

export default PaginationFooter;
