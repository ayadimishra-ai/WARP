import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export const SendInvitationStep = {
  selectForm: "selectForm",
  selectExistingCompany: "selectExistingCompany",
  selectNewCompany: "selectNewCompany",
  selectExistingUser: "selectExistingUser",
  selectNewUser: "selectNewUser",
};

type StoreStateType = {
  step: keyof typeof SendInvitationStep;
  formId: string | null;
  companyIds: string[];
  groupFormIds: any[];
  parentCompanyId: string | null;
};

type StoreActionType = {
  init: (value: StoreStateType) => void;
  selectForm: (
    formId: StoreStateType["formId"],
    industry: StoreStateType["groupFormIds"],
    isInternalCompany: boolean,
    parentCompanyId: StoreStateType["parentCompanyId"]
  ) => void;
  selectCompanies: (companyIds: StoreStateType["companyIds"]) => void;
  changeStep: (step: StoreStateType["step"]) => void;
  backToFormSelection: () => void;
};

export const initialState: StoreStateType = {
  step: "selectForm",
  formId: null,
  companyIds: [],
  groupFormIds: [],
  parentCompanyId: null,
};

export const useSendInvitationStore = create(
  immer<StoreStateType & StoreActionType>((set) => ({
    ...initialState,
    init: (value) => {
      set((state) => {
        state.step = value.step;
        state.formId = value.formId;
        state.companyIds = value.companyIds;
        state.groupFormIds = value.groupFormIds;
        state.parentCompanyId = value.parentCompanyId;
      });
    },
    selectForm: (
      formId: StoreStateType["formId"],
      industry: StoreStateType["groupFormIds"],
      isInternalCompany: boolean,
      // step: StoreStateType["step"] | undefined = "selectExistingCompany",
      parentCompanyId: StoreStateType["parentCompanyId"]
    ) => {
      let setStep: StoreStateType["step"];
      if (isInternalCompany) setStep = "selectExistingUser";
      else setStep = "selectExistingCompany";
      set((store) => {
        store.formId = formId;
        store.groupFormIds = industry;
        store.parentCompanyId = parentCompanyId;
        if (store) store.step = setStep;
      });
    },
    selectCompanies: (companyIds: StoreStateType["companyIds"]) => {
      set((store) => {
        store.companyIds = companyIds;
      });
    },
    changeStep: (step: StoreStateType["step"]) =>
      set((store) => {
        store.step = step;
      }),
    backToFormSelection: () =>
      set((store) => {
        store.step = "selectForm";
        store.companyIds = [];
      }),
  }))
);
