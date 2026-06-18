import * as Types from "@/modules/warp/packages/graphql/generated/types";

export interface QuestionnaireLogsFilters {
  formid: string;
  event_type?: string;
  searchTerm?: string;
  limit: number;
  offset: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  dateFrom?: Date | null;
  dateTo?: Date | null;
}

export type QuestionnaireLog = Types.GetQuestionnaireLogsQuery["newformslogs"][number];
