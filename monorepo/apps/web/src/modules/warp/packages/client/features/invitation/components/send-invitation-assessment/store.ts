import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

// Define invitation steps as a const enum for better type safety and performance
export const SendInvitationStep = {
  selectForm: "selectForm",
  selectExistingCompany: "selectExistingCompany",
  selectNewCompany: "selectNewCompany",
  selectExistingUser: "selectExistingUser",
  selectNewUser: "selectNewUser",
} as const;

// Type for group form data
interface GroupForm {
  id: string;
  name: string;
  isActive: boolean;
}

// Type for the store state with improved type safety
interface StoreStateType {
  step: keyof typeof SendInvitationStep;
  formId: string | null;
  companyIds: string[];
  groupFormIds: GroupForm[];
  isInternal: boolean;
  parentCompanyId: string | null;
  startDate: Date | null;
  endDate: Date | null;
}

// Type for store actions with improved documentation
interface StoreActionType {
  /** Initialize the store with a complete state */
  init: (value: StoreStateType) => void;

  /** Select a form and update related state */
  selectForm: (
    formId: string | null,
    groupFormIds: GroupForm[],
    isInternal: boolean,
    parentCompanyId: string | null
  ) => void;

  /** Update selected companies */
  selectCompanies: (companyIds: string[]) => void;

  /** Change the current step */
  changeStep: (step: keyof typeof SendInvitationStep) => void;

  /** Reset to form selection step */
  backToFormSelection: () => void;

  /** Set the assessment period dates */
  setAssessmentPeriod: (startDate: Date | null, endDate: Date | null) => void;
}

export const initialState: StoreStateType = {
  step: SendInvitationStep.selectExistingCompany,
  formId: null,
  companyIds: [],
  groupFormIds: [],
  isInternal: false,
  parentCompanyId: null,
  startDate: null,
  endDate: null,
};

export const useSendInvitationStore = create(
  immer<StoreStateType & StoreActionType>((set) => ({
    ...initialState,

    init: (value: StoreStateType) => {
      set((state) => {
        Object.assign(state, value);
      });
    },

    selectForm: (
      formId: string | null,
      groupFormIds: GroupForm[],
      isInternal: boolean,
      parentCompanyId: string | null
    ) => {
      if (!formId) {
        console.warn("Attempting to select form with null formId");
        return;
      }

      set((store) => {
        // Update form-related properties
        store.formId = formId;
        store.groupFormIds = groupFormIds ?? [];
        store.isInternal = isInternal;
        store.parentCompanyId = parentCompanyId;
        store.companyIds = []; // Reset selected companies when form changes

        // When switching between internal/external, handle the step correctly
        const isCurrentlyInternalView =
          store.step === SendInvitationStep.selectExistingUser ||
          store.step === SendInvitationStep.selectNewUser;

        // If internal flag changed, update the step accordingly
        if (isInternal && !isCurrentlyInternalView) {
          // Switching to internal
          store.step = SendInvitationStep.selectExistingUser;
        } else if (!isInternal && isCurrentlyInternalView) {
          // Switching from internal to external
          store.step = SendInvitationStep.selectExistingCompany;
        }
      });
    },

    selectCompanies: (companyIds: string[]) => {
      set((store) => {
        store.companyIds = [...companyIds];
      });
    },

    changeStep: (step: keyof typeof SendInvitationStep) => {
      set((store) => {
        store.step = step;
      });
    },

    backToFormSelection: () => {
      set((store) => {
        store.step = SendInvitationStep.selectForm;
        store.companyIds = [];
      });
    },

    setAssessmentPeriod: (startDate: Date | null, endDate: Date | null) => {
      set((store) => {
        store.startDate = startDate;
        store.endDate = endDate;
      });
    },
  }))
);
