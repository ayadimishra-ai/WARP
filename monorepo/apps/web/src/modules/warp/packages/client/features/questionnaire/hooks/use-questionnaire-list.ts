import { useCallback } from "react";
import type { QuestionnaireFilters } from "../types/questionnaire.types";

// Import the real GraphQL query now that codegen is available
import { Order_By } from "@/modules/warp/packages/graphql/generated/types";
import { useGetQuestionnaireListQuery } from "@/modules/warp/packages/graphql/queries/generated/get-questionnaire-list";

export const useQuestionnaireList = (filters: QuestionnaireFilters) => {
  const buildWhereClause = useCallback((filters: QuestionnaireFilters) => {
    // Build GraphQL where clause from filters
    const conditions: any = {};

    if (filters.title) {
      conditions.title = { _ilike: `%${filters.title}%` };
    }

    if (filters.description) {
      conditions.description = { _ilike: `%${filters.description}%` };
    }

    if (filters.type) {
      conditions.formtype = { _ilike: `%${filters.type}%` };
    }

    if (filters.tags && filters.tags.length > 0) {
      // For _text type fields with limited operators, we'll have to implement client-side filtering
      // In a real implementation, you'd want to restructure your database schema or create a custom SQL function

      // We won't filter tags on the server since _text doesn't support pattern matching
      // We'll filter the results client-side in the processQuestionnaires function

      // This is a workaround until a better server-side filtering option is available
      console.log("Tag filtering will be handled client-side");
    }

    if (filters.dateRange) {
      conditions.created_at = {
        _gte: filters.dateRange.start.toISOString(),
        _lte: filters.dateRange.end.toISOString(),
      };
    }

    return conditions;
  }, []);

  // const buildOrderBy = useCallback(
  //   (sortBy?: string, sortDirection?: "asc" | "desc") => {
  //     if (!sortBy) return [{ created_at: Order_By.Desc }];

  //     // Map sortBy values to database column names if needed
  //     let dbColumn = sortBy;
  //     if (sortBy === "formtype") {
  //       dbColumn = "formtype";
  //     } else if (sortBy === "companyNames" || sortBy === "assignedTo") {
  //       // For companyNames, we'll sort in the client side since
  //       // it's a computed field from a related table
  //       dbColumn = "created_at"; // Default sort if sorting by companyNames
  //     }

  //     return [
  //       { [dbColumn]: sortDirection === "desc" ? Order_By.Desc : Order_By.Asc },
  //     ];
  //   },
  //   []
  // );

  const buildOrderBy = useCallback(
    (sortBy?: string, sortDirection?: "asc" | "desc") => {
      if (!sortBy) return [{ created_at: Order_By.Desc }];

      // Map sortBy values to database column names if needed
      let dbColumn = sortBy;
      if (sortBy === "formtype") {
        dbColumn = "formtype";
      } else if (sortBy === "companyNames") {
        // For companyNames, we'll sort in the client side since
        // it's a computed field from a related table
        dbColumn = "created_at"; // Default sort if sorting by companyNames
      }

      return [
        {
          [dbColumn]: sortDirection === "desc" ? Order_By.Desc : Order_By.Asc,
        },
      ];
    },
    []
  );

  // Using the real GraphQL implementation
  const { data, loading, error, refetch } = useGetQuestionnaireListQuery({
    variables: {
      limit: filters.limit || 10,
      offset: filters.offset || 0,
      where: buildWhereClause(filters),
      orderBy: buildOrderBy(filters.sortBy, filters.sortDirection),
    },
    // Don't try to serialize circular references
    errorPolicy: "all",
    // Prevent unnecessary re-fetches
    fetchPolicy: "cache-and-network",
    onError: (error) => {
      console.error("GraphQL query error:", error.message);
    },
  });

  // Process the data from GraphQL - make sure we're not passing any circular references
  const processQuestionnaires = useCallback(() => {
    if (!data?.Form) return [];

    // Debug logging to inspect the actual data structure
    if (data.Form.length > 0) {
      console.log("First item from GraphQL:", data.Form[0]);
    }

    // Map the data to ensure we only extract the properties we need
    let processedData = data.Form.map((item) => {
      // Extract company names from CompanyForms
      const companyNames = item.CompanyForms
        ? item.CompanyForms.filter((cf) => cf.Company && cf.Company.name)
            .map((cf) => cf.Company.name)
            .join(", ")
        : "";

      return {
        id: item.id || "",
        title: item.title || "",
        description: item.description || "",
        type: item.type || "",
        formtype: item.formtype || "",
        tags:
          typeof item.tags === "string" ? item.tags : String(item.tags || ""),
        assignedTo:
          item.CompanyForms && item.CompanyForms.length > 0
            ? item.CompanyForms[0].Company?.id ||
              item.CompanyForms[0].companyId ||
              ""
            : "",
        companyNames: companyNames,
        created_at: item.created_at || "",
        updated_at: item.updated_at || "",
        isOldQuestionnaire: !!item.isOldQuestionnaire,
        FormInvitationId: item.FormInvitations || { id: "" },
        logsCount: item.newformslogs_aggregate?.aggregate?.count || 0,
      };
    });

    // Client-side filtering for tags since we can't do it effectively on the server
    if (filters.tags && filters.tags.length > 0) {
      processedData = processedData.filter((item) => {
        if (!item.tags) return false;

        try {
          // Normalize the tags value to handle different data formats
          let itemTags: string[] = [];

          if (typeof item.tags === "string") {
            // Handle string format (comma-separated)
            if (item.tags.trim()) {
              itemTags = item.tags
                .split(",")
                .map((tag: string) => tag.trim().toLowerCase());
            }
          } else if (Array.isArray(item.tags)) {
            // Handle array format
            itemTags = (item.tags as any[]).map((tag: any) =>
              (typeof tag === "string" ? tag : String(tag)).trim().toLowerCase()
            );
          } else if (item.tags && typeof item.tags === "object") {
            // Handle object format (could be JSON)
            console.log("Tags is an object:", item.tags);
            const tagStr = JSON.stringify(item.tags);
            itemTags = [tagStr.toLowerCase()];
          } else {
            // Handle any other format by converting to string
            const tagStr = String(item.tags).trim();
            if (tagStr) {
              itemTags = [tagStr.toLowerCase()];
            }
          }

          // Check if any of the filter tags exist in the item's tags
          return filters.tags!.some((filterTag: string) => {
            const normalizedFilterTag = filterTag.toLowerCase();
            return itemTags.some((itemTag) =>
              itemTag.includes(normalizedFilterTag)
            );
          });
        } catch (error) {
          console.error(
            "Error processing tags:",
            error,
            "Item tags:",
            item.tags
          );
          return false;
        }
      });
    }

    // Client-side sorting for companyNames
    if (filters.sortBy === "companyNames") {
      processedData.sort((a, b) => {
        const aCompany = a.companyNames || "";
        const bCompany = b.companyNames || "";

        if (filters.sortDirection === "asc") {
          return aCompany.localeCompare(bCompany);
        } else {
          return bCompany.localeCompare(aCompany);
        }
      });
    }

    return processedData;
  }, [data, filters.tags, filters.sortBy, filters.sortDirection]);

  const questionnaires = processQuestionnaires();

  // Get server-side count, but adjust if we did client-side filtering
  let totalCount = data?.Form_aggregate?.aggregate?.count || 0;

  // If we've done client-side filtering for tags, adjust the total count
  if (filters.tags && filters.tags.length > 0) {
    totalCount = questionnaires.length;
  }

  const offset = filters.offset || 0;
  const limit = filters.limit || 10;
  const hasNextPage = offset + limit < totalCount;

  return {
    questionnaires,
    totalCount,
    hasNextPage,
    loading,
    error,
    refetch,
  };
};
