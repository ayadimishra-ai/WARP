import { Flex, Pagination, Select, Text } from "@mantine/core";
import React from "react";
import { FaCaretDown } from "react-icons/fa";
import { useQuestionnaireFilters } from "../hooks";

interface QuestionnairePaginationProps {
  totalCount: number;
}

export const QuestionnairePagination: React.FC<
  QuestionnairePaginationProps
> = ({ totalCount }) => {
  const { setPagination, currentPage, pageSize, updateFilters, filters } =
    useQuestionnaireFilters();

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setPagination({
        page,
        pageSize,
        total: totalCount,
      });
    }
  };

  const handlePageSizeChange = (newPageSize: string | null) => {
    const size = parseInt(newPageSize || "5");
    updateFilters({
      limit: size,
      offset: 0,
    });
  };

  if (totalCount === 0) {
    return null;
  }

  // Calculate the range of items currently shown
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  // Pagination styles matching PaginationFooter
  const paginationStyles = {
    control: {
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
  };

  const PaginationComponent = (
    <Pagination
      styles={paginationStyles}
      total={totalPages}
      value={currentPage}
      onChange={handlePageChange}
    />
  );

  const ItemsPerPageComponent = (
    <Flex align="center" gap={10}>
      <Text size="14px" color="#444444">
        Items per page:
      </Text>
      <Select
        value={pageSize.toString()}
        onChange={handlePageSizeChange}
        data={[
          { value: "5", label: "5" },
          { value: "10", label: "10" },
          { value: "15", label: "15" },
          { value: "20", label: "20" },
        ]}
        rightSection={
          <Flex>{FaCaretDown({ color: "#9098a9", size: 20 })}</Flex>
        }
        rightSectionPointerEvents="none"
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
          option: {
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
      <Text size="14px" color="#444444">
        {startIndex}-{endIndex} of {totalCount}
      </Text>
    </Flex>
  );

  return (
    <Flex justify="space-between" align="center" pt={10} wrap="wrap" gap={10}>
      {PaginationComponent}
      {ItemsPerPageComponent}
    </Flex>
  );
};
