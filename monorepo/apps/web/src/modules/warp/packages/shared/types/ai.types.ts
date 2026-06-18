// AI Document Types
export enum DocumentType {
  ESG_DOCUMENTS = "esg_documents",
  BRSR_DOCUMENTS = "brsr_documents",
  DOCUMENT_REPO = "company_documents",
}

// AI Service Source Interface
export interface AIServiceSource {
  document_type: string;
  source_file_id: number;
  page_number: number;
  file_url: string;
  file_name: string;
  source_content: string;
  document_log_id: string;
  expiry_date: string | null;
  extraction_percentage: number | null;
}

// AI Response Props Interface
export interface AIResponseProps {
  content: string;
  sources?: AIServiceSource[];
  queryType?: string;
  metadata?: any;
  userQuery: string;
  features?: SubscriptionFeatures;
}

// Document Type Color Mapping Type
export type DocumentTypeColorMap = {
  [key in DocumentType]: string;
};

// Document Type Label Mapping Type
export type DocumentTypeLabelMap = {
  [key in DocumentType]: string;
};

// Chat AI Hook Types
export interface UseChatAIProps {
  companyId?: string;
  userId?: string;
  companyName?: string;
  selectedDocuments?: Array<{ id: string, fileName: string }>;
  selectedDataSources?: string[];
}

export interface DocumentsState {
  documents: DocumentLog[];
  hasMoreDocuments: boolean;
  loadingDocuments: boolean;
  loadingMoreDocuments: boolean;
  searchTerm: string;
}

export interface ChatAIState {
  message: string;
  enableGraphicalOutput: boolean;
  isLoading: boolean;
  error: string | null;
  lastResponse: ChatResponse | null;
  conversation: ConversationMessage[];
  conversationId: string | null;
  conversationLoading: boolean;
  conversationList: ConversationListState;
  conversationMessages: ConversationMessagesState;
  documentsState: DocumentsState;
}

export interface ConversationMessage {
  role: MessageRole;
  content: string;
  messageId?: string;
  createdAt?: string;
  sources?: any[];
  responseType?: QueryType;
}

export interface ConversationItem {
  conversationId: string;
  userId: string;
  companyId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ConversationListState {
  conversations: ConversationItem[];
  hasMoreConversations: boolean;
  loadingConversations: boolean;
  loadingMoreConversations: boolean;
  searchTerm: string;
}

export interface ConversationMessagesState {
  messages: ConversationMessage[];
  hasMoreMessages: boolean;
  loadingMessages: boolean;
  loadingMoreMessages: boolean;
}

export interface ChatAIActions {
  setMessage: (message: string) => void;
  setEnableGraphicalOutput: (enabled: boolean) => void;
  handleSend: () => Promise<void>;
  clearError: () => void;
  clearLastResponse: () => void;
  loadConversation: (conversationId: string) => Promise<void>;
  clearConversation: () => void;
  loadMoreConversations: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  loadMoreDocuments: () => Promise<void>;
  refreshDocuments: () => Promise<void>;
  searchConversations: (searchTerm: string) => Promise<void>;
  searchDocuments: (searchTerm: string) => Promise<void>;
}

export interface ChatResponse {
  queryOutput: string;
  sources: AIServiceSource[];
  conversationId: string | null;
  queryType: QueryType;
  timestamp: Date;
}

export interface QueryDocumentsPayload {
  query: string;
  queryType: QueryType;
  companyId: string;
  companyName: string;
  userId?: string;
  documentsToSearch: string[];
  targetDocuments: string[];
  conversationId?: string;
}

export interface SubscriptionQuota {
  textualRemaining: number;
  graphicalRemaining: number;
  textualTotal: number;
  graphicalTotal: number;
  hasActiveSubscription: boolean;
  canUseTextual: boolean;
  canUseGraphical?: boolean;
}

export interface SubscriptionFeatures {
  hasDocumentRepo?: boolean;
  hasESG?: boolean;
  hasBRSR?: boolean;
  textualLimit: number;
  graphicalLimit: number;
  subscriptionName: string;
}
interface AiSuggestedDocument {
  id: string;
  title: string;
  isOther: boolean;
}

export interface DocumentLog {
  id: string;
  originalFileName: string;
  fileName: string;
  status: string;
  extractionPercentage: number;
  fileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  AISuggestedDocuments?: AiSuggestedDocument;
}

export interface ChatMessagesProps {
  messages: Message[];
  sidePanelOpen: boolean;
  features?: SubscriptionFeatures;
  onLoadMoreMessages?: () => void;
  hasMoreMessages?: boolean;
  loadingMoreMessages?: boolean;
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  sources?: AIServiceSource[];
  conversationId?: string | null;
  timestamp: Date;
  metadata?: any;
  responseType?: QueryType;
}

// Role and Query Type Enums
export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
}

export enum QueryType {
  TEXTUAL = "textual",
  GRAPHICAL = "graphical",
}

export enum MessageType {
  USER = "user",
  AI = "ai",
}

export enum DataSourceType {
  ESG_DOCUMENTS = "esg_documents",
  BRSR_DOCUMENTS = "brsr_documents",
  COMPANY_DOCUMENTS = "company_documents",
}

export enum DocumentStatus {
  UPLOADED = "Uploaded",
}

// UseChatAI Hook Return Type
export interface UseChatAIReturn extends ChatAIState, ChatAIActions {
  subscription: any; // Subscription type from utils
  subscriptionLoading: boolean;
  quota: SubscriptionQuota;
  features: any; // ReturnType from getSubscriptionFeatures
  loadConversation: (conversationId: string) => Promise<void>;
  clearConversation: () => void;
  loadMoreConversations: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  documents: DocumentLog[];
  documentsLoading: boolean;
  effectiveCompanyName?: string;
}
