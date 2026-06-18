// Core data interfaces for questionnaire listing feature

export interface QuestionnaireListItem {
  id: string;
  title: string; // Maps to Form.title -> Questionnaire Name column
  description: string; // Maps to Form.description
  type: string; // Maps to Form.type
  formtype: string; // Maps to Form.formtype -> Reporting Framework/Assessment column
  tags: string; // Maps to Form.tags
  assignedTo: string; // Changed from literal "admin" to allow any string value
  companyNames: string; // Comma-separated list of company names from CompanyForms
  created_at: string;
  updated_at: string;
  isOldQuestionnaire?: boolean; // Flag to disable actions for old questionnaires
  FormInvitationId?: {
    id?: string;
  }[];
  questions?: string;
  timeinminutes?: number;
  logsCount?: number;
}

export interface QuestionnaireFilters {
  title?: string;
  description?: string;
  type?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  accessToken?: string;
}

export interface QuestionnaireListResponse {
  forms: QuestionnaireListItem[];
  totalCount: number;
  hasNextPage: boolean;
}

// UI-only modal states
export interface ModalStates {
  uploadModalOpen: boolean;
  downloadModalOpen: boolean;
  assignModalOpen: boolean;
  selectedQuestionnaire?: QuestionnaireListItem;
  isCreateMode?: boolean; // Flag to indicate if the modal is in create mode
}

// Filter dropdown options
export interface FilterOptions {
  types: string[];
  tags: string[];
}

// Pagination interface
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

// Sorting interface
export interface SortingState {
  column: string;
  direction: "asc" | "desc";
}