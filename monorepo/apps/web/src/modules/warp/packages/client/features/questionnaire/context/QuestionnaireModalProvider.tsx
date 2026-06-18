import React, { createContext, useContext } from "react";
import { useQuestionnaireModals } from "../hooks";
import {
  ModalStates,
  QuestionnaireListItem,
} from "../types/questionnaire.types";


// Create context with the modal state and handlers
interface QuestionnaireModalContextType {
  modalStates: ModalStates;
  openUploadModal: (questionnaire: QuestionnaireListItem) => void;
  openCreateModal: () => void; // New method to open modal in create mode
  closeUploadModal: () => void;
  openDownloadModal: (questionnaire: QuestionnaireListItem) => void;
  closeDownloadModal: () => void;
  openAssignModal: (questionnaire: QuestionnaireListItem) => void;
  closeAssignModal: () => void;
  handleUpload: (questionnaire: QuestionnaireListItem, file?: File) => void;
  handleCreateQuestionnaire: (
    title: string,
    description: string,
    file: File,
    formType: string,
    isOldQuestionnaire: boolean,
    questions: string,
    timeInMinutes: number
  ) => Promise<any>; // New method for creating questionnaire
  handleDownload: (
    questionnaire: QuestionnaireListItem,
    format?: "pdf" | "excel" | "json"
  ) => void;
  handleAssign: (
    questionnaire: QuestionnaireListItem,
    assigneeId: string,
    dueDate?: Date,
    notes?: string,
    assignmentType?: "Internal" | "External",
    internalData?: any
  ) => void;
  selectedQuestionnaire: QuestionnaireListItem | undefined;
  isUploadModalOpen: boolean;
  isDownloadModalOpen: boolean;
  isAssignModalOpen: boolean;
  isCreateMode: boolean; // New property to check if we're in create mode
  setRefetchFunction?: (refetch: () => void) => void; // New method to set refetch function
}

const QuestionnaireModalContext = createContext<
  QuestionnaireModalContextType | undefined
>(undefined);

// Provider component that wraps the app and makes the modal state available to all components
export const QuestionnaireModalProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const modalHooks = useQuestionnaireModals();

  return (
    <QuestionnaireModalContext.Provider value={modalHooks}>
      {children}
    </QuestionnaireModalContext.Provider>
  );
};

// Custom hook to use the modal context
export const useQuestionnaireModalContext = () => {
  const context = useContext(QuestionnaireModalContext);
  if (context === undefined) {
    throw new Error(
      "useQuestionnaireModalContext must be used within a QuestionnaireModalProvider"
    );
  }
  return context;
};
